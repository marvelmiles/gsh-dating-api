import { getRandomElement } from ".";

export function generateNigerianPhoneNumber() {
  // Nigerian phone numbers start with a digit from 7 to 9
  const prefixes = [
    "701",
    "702",
    "703",
    "704",
    "705",
    "706",
    "707",
    "708",
    "709",
    "720",
    "721",
    "722",
    "730",
    "740",
    "741",
    "742",
    "743",
    "750",
    "760",
    "770",
    "780",
    "790",
    "800",
    "810",
    "811",
    "820",
    "830",
    "840",
    "850",
    "860",
    "870",
    "880",
    "890",
    "900",
    "910",
    "920",
    "930",
    "940",
    "950",
    "960",
    "970",
    "980",
    "990",
  ];

  // Choose a random prefix from the list
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  // Generate the remaining 7 digits (0-9)
  let remainingDigits = "";
  for (let i = 0; i < 7; i++) {
    remainingDigits += Math.floor(Math.random() * 10).toString();
  }

  // Combine to form the full phone number
  const phoneNumber = `+234 ${prefix} ${remainingDigits.slice(
    0,
    3
  )} ${remainingDigits.slice(3)}`;

  return phoneNumber;
}

export function getSocialLink(type, data) {
  if (!data) return "";

  return {
    tg: `https://t.me/${data}`,
    wa: `https://wa.me/${data}`,
    fb: `https://facebook.com/${data}`,
  }[type];
}

export function generateFullName(gender = "male", numNames = 10) {
  const maleNames = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Charles",
    "Joseph",
    "Thomas",
  ];

  const femaleNames = [
    "Mary",
    "Patricia",
    "Linda",
    "Barbara",
    "Elizabeth",
    "Jennifer",
    "Maria",
    "Susan",
    "Jessica",
    "Sarah",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
  ];

  const uniqueFullNames = new Set();

  while (uniqueFullNames.size < numNames) {
    const isMale = Math.random() < 0.5; // Randomly choose male or female
    const firstName = isMale
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    uniqueFullNames.add(`${firstName} ${lastName}`);
  }

  const groupedNames = {
    male: [],
    female: [],
  };

  uniqueFullNames.forEach((fullName) => {
    const [firstName] = fullName.split(" ");
    if (maleNames.includes(firstName)) {
      groupedNames.male.push(fullName);
    } else {
      groupedNames.female.push(fullName);
    }
  });

  return getRandomElement(groupedNames[gender.toLowerCase()]);
}

export const generateAboutMe = (gender = "male") => {
  const maleDescriptions = [
    "I'm a passionate traveler who has explored over 15 countries and counting. My favorite adventures include trekking in the Andes and savoring street food in Bangkok. When I'm not on a flight, you can find me at the local coffee shop, sipping a flat white and reading a good book. I enjoy hiking on weekends and playing guitar in my spare time. I'm looking for someone who loves to explore new places, whether it's a hidden gem in the city or a secluded beach. If you appreciate witty banter and long conversations under the stars, let's connect!",

    "Hi there! I'm an aspiring chef who loves to cook up a storm in the kitchen. My friends say I'm the 'go-to' person for dinner parties. When I’m not whipping up a new recipe, I love cycling along scenic routes and discovering local farmers' markets. I'm also a huge sports fan and never miss a game of my favorite team. I’m searching for someone who enjoys good food, good company, and perhaps a little friendly competition. Let's share our culinary adventures and maybe even find the best pizza joint in town together!",

    "Hey! I'm an introverted bookworm with a penchant for fantasy novels and classic literature. My weekends are often spent curled up with a good book or binge-watching the latest sci-fi series. I also enjoy painting and sketching, as it helps me express my creative side. I'm looking for someone who can appreciate quiet moments but is also up for spontaneous adventures. If you love cozy nights in and occasional explorations of art galleries or indie bookshops, I'd love to hear from you!",

    "I'm a software engineer by day and a music enthusiast by night. I play the piano and am constantly on the lookout for live music events in the city. My passion for technology drives my creativity, and I love building apps that solve real-world problems. I enjoy hiking and exploring nature on weekends, and I’m looking for a partner who shares my love for music and the outdoors. Let's jam together or discover a new hiking trail. If you're a fellow techie or just someone who enjoys good tunes, reach out!",

    "Adventurous spirit seeking someone to join me in my quest for the perfect cup of coffee. I'm a travel addict who spends my weekends exploring new cafes and checking out local events. My friends say I’m the funny one, always ready with a joke to lighten the mood. I'm looking for someone who can appreciate humor and spontaneity. If you love coffee, exploring art galleries, and have a knack for turning mundane outings into unforgettable adventures, let's make some memories together!",

    "I’m a compassionate person with a love for animals, especially dogs. My furry friend, Max, is my sidekick on hikes and park adventures. I work as a social worker, where I strive to make a positive impact in my community. When I'm not working, I enjoy volunteering at animal shelters and participating in local charity events. I'm looking for someone who shares my passion for helping others and enjoys spending time outdoors. If you’re kind-hearted and love dogs as much as I do, we might just be a perfect match!",

    "Passionate about fitness and living a healthy lifestyle! I spend a lot of time at the gym, running marathons, and trying new workout classes. I'm also a big fan of outdoor activities like rock climbing and kayaking. On weekends, you can find me meal prepping or attending fitness workshops. I'm searching for someone who shares my enthusiasm for fitness and enjoys staying active. If you love a challenge, whether it’s a workout or trying new things, I’d love to meet you and maybe hit the gym together!",

    "As an avid gamer, I’m always on the lookout for new challenges and adventures. Whether I'm immersed in a fantasy world or strategizing with friends online, I love gaming culture. But don't let that fool you; I also enjoy getting out and trying new restaurants or attending gaming conventions. I'm looking for someone who can appreciate both the excitement of gaming and the joy of exploring new culinary delights. If you can teach me a new game or share a favorite restaurant, I think we’ll get along great!",

    "Hello! I’m a film buff who loves everything from classic cinema to the latest blockbusters. I enjoy hosting movie nights and diving deep into discussions about themes and characters. In my free time, I also enjoy photography and capturing the beauty of everyday life. I’m looking for someone who appreciates film and enjoys creative pursuits. If you're up for movie marathons, gallery exhibitions, and meaningful conversations about life, let’s connect and share our favorite films!",

    "I’m an outdoor enthusiast who loves to camp, hike, and explore national parks. My ideal weekend includes hiking a new trail and cooking over an open fire. I have a curious mind and a desire to learn about nature and conservation. I'm searching for someone who shares my love for the great outdoors and is ready for spontaneous road trips. If you're ready to pitch a tent and stargaze or explore the beauty of nature, I’d love to meet you!",
  ];

  const femaleDescriptions = [
    "I’m a creative soul with a love for writing and painting. I enjoy expressing myself through art and believe that every moment can be a canvas for creativity. When I’m not painting, you can find me journaling or participating in local art exhibitions. I'm passionate about self-discovery and love engaging in deep conversations about life, art, and everything in between. I'm looking for someone who appreciates creativity and can inspire me to see the world through a different lens. Let's embark on this artistic journey together!",

    "A free spirit who loves exploring the world and meeting new people! I have a deep passion for travel, having visited 20 countries and counting. I believe that every culture has a story to tell, and I enjoy immersing myself in new experiences. I also love cooking, especially trying out international recipes from the countries I've visited. I'm looking for someone who shares my adventurous spirit and is excited to explore new destinations and cuisines together. If you're ready for spontaneous trips and culinary experiments, let’s chat!",

    "I’m a passionate advocate for environmental sustainability and love spending time outdoors. I enjoy hiking, gardening, and volunteering for local conservation projects. I believe in making a positive impact on the planet and love connecting with others who share this passion. My friends describe me as kind and approachable, and I enjoy meeting new people who have a similar outlook on life. If you're looking for someone who values nature and is enthusiastic about protecting it, we might be the perfect match!",

    "Hi! I’m an avid reader and a lifelong learner. I spend my weekends buried in novels, and I’m always on the hunt for new authors to explore. I also enjoy attending workshops and lectures on a variety of topics. I’m looking for someone who appreciates intellectual conversations and shares my love for books and learning. If you enjoy discussing everything from literature to philosophy, I would love to hear your thoughts over coffee or tea!",

    "I’m a fitness enthusiast who believes in the power of a healthy lifestyle. I enjoy everything from yoga and Pilates to weightlifting and running. I love participating in local fitness events and am always looking to try new classes. When I’m not working out, I enjoy cooking healthy meals and sharing recipes with friends. I’m looking for someone who shares my passion for fitness and can motivate me to reach new goals. If you're up for workout challenges and healthy living, let’s inspire each other!",

    "As a nature lover, I find joy in the beauty of the outdoors. I enjoy hiking, camping, and spending weekends at the beach. My dream is to visit every national park in the country and appreciate the great outdoors. I'm searching for someone who shares my enthusiasm for nature and outdoor adventures. If you love hiking trails, beach picnics, and stargazing, we’ll get along famously!",

    "I’m a passionate foodie who loves exploring new culinary delights! Whether it’s trying out new recipes at home or discovering hidden gem restaurants in the city, I’m always up for a delicious adventure. I enjoy hosting dinner parties and love bringing friends together over good food. I’m looking for someone who shares my enthusiasm for food and can introduce me to new flavors. Let’s explore the local food scene together!",

    "As a creative writer, I have a passion for storytelling. I enjoy weaving tales and exploring the depths of human emotions through my writing. I also love attending open mic nights and poetry slams to share my work with others. I'm looking for someone who appreciates creativity and enjoys deep conversations about life and art. If you’re a fellow wordsmith or just someone who loves good stories, I’d love to hear from you!",

    "I’m an energetic individual who loves dance and music! Whether it's salsa, hip-hop, or just dancing around my living room, I find joy in movement. I also enjoy going to concerts and discovering new music. I'm looking for someone who loves to dance and can share playlists with me. If you’re up for spontaneous dance parties or exploring live music venues, let’s create some rhythm together!",

    "I’m a dedicated volunteer and advocate for social change. I spend my free time working with various charities and organizations that support underprivileged communities. I believe in giving back and making a difference in the world. I’m searching for someone who shares my passion for social justice and enjoys engaging in meaningful conversations about life. If you’re looking for a partner who values kindness and compassion, we might just be a perfect fit!",
  ];

  return getRandomElement(
    gender.toLowerCase() === "male" ? maleDescriptions : femaleDescriptions
  );
};

export const generateProfileCover = (gender = "male") => {
  const femalePics = [
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/247322/pexels-photo-247322.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/428321/pexels-photo-428321.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/413885/pexels-photo-413885.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/789296/pexels-photo-789296.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/735552/pexels-photo-735552.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/1914837/pexels-photo-1914837.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/807228/pexels-photo-807228.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3605354/pexels-photo-3605354.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/4338459/pexels-photo-4338459.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/11837194/pexels-photo-11837194.png?auto=compress&cs=tinysrgb&w=600",
  ];

  const malePics = [
    "https://images.pexels.com/photos/28792459/pexels-photo-28792459/free-photo-of-professional-photographer-adjusts-camera-in-urban-setting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/28845390/pexels-photo-28845390/free-photo-of-stylish-adult-standing-in-vibrant-red-leaves.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/28831294/pexels-photo-28831294/free-photo-of-man-playing-turkish-baglama-in-outdoor-setting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/28354681/pexels-photo-28354681/free-photo-of-a-man-in-a-hat-and-white-pants-standing-on-a-beach.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/28283491/pexels-photo-28283491/free-photo-of-a-man-with-glasses-and-a-beanie-on.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/27969057/pexels-photo-27969057/free-photo-of-man-in-short-sleeved-shirt-and-jeans-leaning-on-concrete-block.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/28224053/pexels-photo-28224053/free-photo-of-a-man-in-a-cowboy-hat-and-shirt-smiling.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/27151405/pexels-photo-27151405/free-photo-of-happy-english-soccer-fan-posing-in-the-rain-at-the-euro-2024-semi-finals.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/27086828/pexels-photo-27086828/free-photo-of-a-young-man-taking-selfie.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/12720234/pexels-photo-12720234.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/16495732/pexels-photo-16495732/free-photo-of-man-sitting-and-posing-topless.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/18002046/pexels-photo-18002046/free-photo-of-muscular-model-posing-by-window.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/14623667/pexels-photo-14623667.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  ];

  const femaleVideos = [
    "https://videos.pexels.com/video-files/10740727/10740727-hd_2560_1440_30fps.mp4",
    "https://videos.pexels.com/video-files/3327253/3327253-hd_1920_1080_24fps.mp4",
    "https://videos.pexels.com/video-files/2873755/2873755-uhd_2560_1440_25fps.mp4",
    "https://videos.pexels.com/video-files/6835712/6835712-hd_1920_1080_25fps.mp4",
    "https://videos.pexels.com/video-files/8531825/8531825-uhd_2560_1440_25fps.mp4",
  ];

  const maleVideos = [
    "https://videos.pexels.com/video-files/6388436/6388436-uhd_2560_1440_25fps.mp4",
    "https://videos.pexels.com/video-files/12405698/12405698-hd_1920_1080_30fps.mp4",
    "https://videos.pexels.com/video-files/2722910/2722910-hd_1920_1080_30fps.mp4",
    "https://videos.pexels.com/video-files/4832216/4832216-uhd_2560_1440_30fps.mp4",
    "https://videos.pexels.com/video-files/5329612/5329612-uhd_2732_1440_25fps.mp4",
  ];

  return {
    male: getRandomElement(malePics, 4)
      .map((url) => ({
        url,
        mimetype: "image",
      }))
      .concat({
        url: getRandomElement(maleVideos),
        mimetype: "video",
      }),
    female: getRandomElement(femalePics, 4)
      .map((url) => ({
        url,
        mimetype: "image",
      }))
      .concat({
        url: getRandomElement(femaleVideos),
        mimetype: "video",
      }),
  }[gender.toLowerCase()];
};
