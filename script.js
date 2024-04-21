console.log("let play songs");

let currentSong = new Audio();
let songs;
let isMuted = false;
let currFolder;
const secondToMinutesSeconds = (seconds) => {
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.round(seconds % 60); // Round the seconds
  var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  var formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
  return formattedMinutes + ":" + formattedSeconds;
};

const getSongs = async (folder) => {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`);

  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li><img src="./assest/music.svg" width="30px" alt="" />
      <div class="info">
        <div>${song.replaceAll("%20", " ")} </div>
        <div>Kartik</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img src="./assest/play-btn1.svg" width="20px" alt="" />
      </div> </li>`;
  }
  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      let song = e.querySelector(".info").firstElementChild.innerHTML.trim();

      playMusic(song);
    });
  });
  return songs;
};

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "./assest/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

const displayAlbms = async () => {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);

  let response = await a.text();

  let div = document.createElement("div");

  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[1];

      // Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `
      <div data-folder=${folder} class="card">
              <div class="play_button">
                <img src="./assest/play-button.png" width="40px" alt="" />
              </div>

              <img
                src="/songs/${folder}/cover.jpg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>
      `;
    }
    // Load the playlist whenever card is clicked
    Array.from(document.querySelectorAll(".card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        let folder_name = item.currentTarget.getAttribute("data-folder");
        let songs = await getSongs(`songs/${folder_name}`);
        playMusic(songs[0]);
      });
    });
  }
};

const main = async () => {
  // Get the list of all the songs
  await getSongs("songs/hindi");

  // playMusic(songs[0], true);
  displayAlbms();

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "./assest/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./assest/play.svg";
    }
  });

  // Attach an event listener to play, next, previous and timeupdate
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  // Add an event listener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  // Add an event listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      let volValue = e.target.value / 100;
      currentSong.volume = volValue;

      if (volValue > 0) {
        vol_mute.src = "./assest/volume.svg";
      } else {
        vol_mute.src = "./assest/mute.svg";
      }
    });

  document.querySelector("#vol_mute").addEventListener("click", () => {
    if (!isMuted) {
      // Mute the volume
      vol_mute.src = "./assest/mute.svg";
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;

      isMuted = true;
    } else {
      // Unmute the volume
      vol_mute.src = "./assest/volume.svg";
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
      isMuted = false;
    }
  });
};

main();
