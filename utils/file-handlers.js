import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import { createError, console500MSG } from "./error.js";
import { Readable } from "stream";
import { FIREBASE_BUCKET_NAME, storage } from "../config/firebase.js";
import { MAIL_CONST } from "../config/constants.js";
import fs from "fs";
import ejs from "ejs";

export const deleteFile = (filePath) => {
  if (!filePath) return;
  filePath = decodeURIComponent(path.basename(filePath));
  return storage
    .bucket(FIREBASE_BUCKET_NAME)
    .file(filePath)
    .delete()
    .then((res) => res)
    .catch((err) => {
      console500MSG(err, "DELETE_FILE_ERROR");
      return err;
    });
};

export const uploadFile = (
  config = {
    type: "image",
    single: true,
    name: "avatar",
    dirPath: "photos",
    maxCount: 1,
  }
) => {
  return [
    (req, res, next) => {
      const getProp = (field = {}) => ({
        name: req.query.fieldName || field.name || "avatar",
        maxCount: req.query.maxCount || field.maxCount || 1,
      });

      return multer({
        storage: new multer.memoryStorage(),
      })[
        config.length
          ? "fields"
          : (config.single === undefined ? true : config.single)
          ? "single"
          : "array"
      ](
        config.length
          ? config.map((field) => getProp(field))
          : getProp(config).name,
        config.length ? undefined : getProp(config).maxCount
      )(req, res, next);
    },
    async (req, res, next) => {
      try {
        const applyQueryConfig = (config = {}) => {
          config.maxDur = req.query.maxDur;
          config.maxSize = req.query.maxSize;
          config.dirPath = config.dirPath || "photos";
          config.type = config.type || "image";

          return config;
        };

        if (req.file)
          req.file = await uploadToFirebase(req.file, applyQueryConfig(config));
        else if (req.files) {
          const errs = [];

          const uploadFiles = async (path) => {
            const files = path ? req.files[path] : req.files;

            for (let i = 0; i < files.length; i++) {
              let file;

              try {
                file = files[i];

                const upload = await uploadToFirebase(
                  file,
                  applyQueryConfig(config.length ? config[i] : config)
                );

                if (path) req.files[path][i] = upload;
                else req.files[i] = upload;
              } catch (err) {
                if (req.query.sequentialEffect === "true") throw err;
                else {
                  errs.push({
                    message: err.message,
                    status: err.status,
                    name: err.name,
                    code: err.code,
                    errIndex: i,
                    file: {
                      ...file,
                      buffer: undefined,
                      stream: undefined,
                    },
                  });
                }
              }
            }
          };

          if (req.files.length) await uploadFiles();
          else {
            for (const key in req.files) {
              await uploadFiles(key);
            }
          }

          if (errs.length)
            throw createError({
              name: "customError",
              message: errs,
            });
        }
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
};

export const sendMail = (
  mailOptions,
  cb,
  service = "Gmail",
  user = MAIL_CONST.user,
  pass = process.env.MAIL_PASSWORD
) => {
  const transporter = nodemailer.createTransport({
    service,
    auth: {
      user,
      pass,
    },
  });
  transporter.sendMail(mailOptions, cb);
};

export const uploadToFirebase = (file, config = {}) => {
  return new Promise((resolve, reject) => {
    let isImg = config.type === "image";
    if (
      config.type &&
      !(config.type === "medias"
        ? (isImg = file.mimetype.indexOf("image") >= 0) ||
          file.mimetype.indexOf("video") >= 0
        : file.mimetype.indexOf(config.type) >= 0)
    )
      return reject(
        createError(`File mimetype ${file.mimetype} not supported`)
      );

    if (!(file.buffer || file.stream))
      throw reject(
        createError(`File content is either damaged or corrupt`, 409)
      );

    // 5gb max size limit
    config.maxSizeLimit = config.maxSizeLimit || 5000000000;
    config.maxSize = Number(config.maxSize) || config.maxSizeLimit;
    config.maxSize > config.maxSizeLimit &&
      (config.maxSize = config.maxSizeLimit);

    if (file.size > config.maxSize)
      return reject(createError(`max size of ${config.maxSize} exceeded`, 400));

    // 12h max duration
    config.maxDurLimit = config.maxDurLimit || 43200;
    config.maxDur = Number(config.maxDur) || config.maxDurLimit;
    config.maxDur > config.maxDurLimit && (config.maxDur = config.maxDurLimit);

    const handleError = (err) => {
      reject(createError(err));
    };
    const uploadFile = (file) => {
      const filename =
        `${config.dirPath ? config.dirPath + "/" : ""}` +
        Date.now() +
        "-" +
        file.originalname;
      const bucket = storage.bucket(FIREBASE_BUCKET_NAME);
      const fileRef = bucket.file(filename);
      const streamConfig = {
        metadata: {
          contentType: file.mimetype,
        },
      };

      const handleSuccess = () => {
        file.filename = filename;
        fileRef
          .makePublic()
          .then(() => {
            file.publicUrl = fileRef.publicUrl();
            resolve(file);
          })
          .catch(handleError);
      };

      const outstream = fileRef.createWriteStream(streamConfig);
      if (file.stream) {
        file.stream.pipe(outstream);
      } else if (file.buffer) {
        outstream.write(file.buffer);
        outstream.end();
      }
      outstream.on("error", handleError);
      outstream.on("finish", handleSuccess);
    };

    if (isImg || !config.maxDur) return uploadFile(file);
    const stream =
      file.stream ||
      new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

    uploadFile(file);
  });
};

export const readTemplateFile = (templateName, tempOpts = {}) => {
  const template = fs.readFileSync(
    path.resolve(process.cwd(), `templates/${templateName}Template.ejs`),
    "utf-8"
  );

  const props = {
    primaryColor: "rgba(18, 14, 251, 1)",
    secondaryColor: "rgba(12, 9, 175, 1)",
    fullname: "valued user",
    heading: "GSH Alert",
    subText: "",
    ...tempOpts,
  };

  return ejs.render(template, props);
};
