// S.to Script - German TV Series Streaming
// Uses the universal framework script with S.to specific configuration

const PLATFORM = "S.to";
const BASE_URL = "https://s.to";
const CONTENT_TYPE = "serie"; // "serie" for s.to, "anime" for aniworld.to

let config = {};

//================ SOURCE API IMPLEMENTATION ================//

source.enable = function (conf, settings, savedState) {
  config = conf ?? {};
};

source.getHome = function () {
  try {
    const dom = fetchHTML("/");
    const results = [];

    const coverLinks = dom.querySelectorAll("a[href*='/stream/']");
    for (let i = 0; i < Math.min(coverLinks.length, 20); i++) {
      const link = coverLinks[i];
      const href = link.getAttribute("href");
      const img = link.querySelector("img");

      if (href && href.includes("/stream/")) {
        const title = extractTitleFromPath(href);
        const thumbnail = img
          ? img.getAttribute("data-src") || img.getAttribute("src")
          : "";

        results.push(
          new PlatformVideo({
            id: new PlatformID(PLATFORM, href, config.id),
            name: title,
            thumbnails: new Thumbnails(
              thumbnail ? [new Thumbnail(thumbnail, 0)] : []
            ),
            author: new PlatformAuthorLink(
              new PlatformID(PLATFORM, href, config.id),
              title,
              BASE_URL + href,
              thumbnail
            ),
            uploadDate: parseInt(new Date().getTime() / 1000),
            duration: 0,
            viewCount: 0,
            url: BASE_URL + href,
            isLive: false,
          })
        );
      }
    }

    return new ContentPager(results, false);
  } catch (e) {
    log("Error in getHome: " + e);
    return new ContentPager([], false);
  }
};

source.searchSuggestions = function (query) {
  return [];
};

source.getSearchCapabilities = function () {
  return {
    types: [Type.Feed.Mixed],
    sorts: [Type.Order.Chronological],
    filters: [],
  };
};

source.search = function (query, type, order, filters) {
  const results = searchContent(query);
  return new ContentPager(results, false);
};

source.getSearchChannelContentsCapabilities = function () {
  return {
    types: [Type.Feed.Mixed],
    sorts: [Type.Order.Chronological],
    filters: [],
  };
};

source.searchChannelContents = function (
  channelUrl,
  query,
  type,
  order,
  filters
) {
  throw new ScriptException("Channel content search not supported");
};

source.searchChannels = function (query) {
  return new ChannelPager([], false, {});
};

source.isChannelUrl = function (url) {
  const pattern = new RegExp(`/${CONTENT_TYPE}/stream/[^/]+/?$`);
  return pattern.test(url);
};

source.getChannel = function (url) {
  const titlePath = extractTitleFromUrl(url);
  const seriesInfo = getSeriesInfo(titlePath);

  return new PlatformChannel({
    id: new PlatformID(PLATFORM, titlePath, config.id),
    name: seriesInfo.title,
    thumbnail: seriesInfo.thumbnail,
    banner: seriesInfo.banner,
    subscribers: 0,
    description: seriesInfo.description || "",
    url: url,
  });
};

source.getChannelContents = function (url) {
  const titlePath = extractTitleFromUrl(url);
  const episodes = getAllEpisodes(titlePath);
  return new ContentPager(episodes, false);
};

source.isContentDetailsUrl = function (url) {
  const pattern = new RegExp(
    `/${CONTENT_TYPE}/stream/.+/staffel-\\d+/episode-\\d+`
  );
  return pattern.test(url);
};

source.getContentDetails = function (url) {
  const match = url.match(
    new RegExp(`/${CONTENT_TYPE}/stream/(.+)/staffel-(\\d+)/episode-(\\d+)`)
  );
  if (!match) throw new ScriptException("Invalid episode URL");

  const [, titlePath, season, episode] = match;

  const seriesInfo = getSeriesInfo(titlePath);
  const episodeInfo = getEpisodeInfo(titlePath, season, episode);

  return new PlatformVideoDetails({
    id: new PlatformID(
      PLATFORM,
      `${titlePath}-s${season}e${episode}`,
      config.id
    ),
    name: episodeInfo.name || `${seriesInfo.title} - S${season}E${episode}`,
    thumbnails: new Thumbnails(
      seriesInfo.thumbnail ? [new Thumbnail(seriesInfo.thumbnail, 0)] : []
    ),
    author: new PlatformAuthorLink(
      new PlatformID(PLATFORM, titlePath, config.id),
      seriesInfo.title,
      `${BASE_URL}/${CONTENT_TYPE}/stream/${titlePath}`,
      seriesInfo.thumbnail
    ),
    uploadDate: parseInt(new Date().getTime() / 1000),
    duration: episodeInfo.duration || 0,
    viewCount: 0,
    url: url,
    isLive: false,
    description: seriesInfo.description || episodeInfo.description || "",
    video: new VideoSourceDescriptor([]),
    context: episodeInfo.streams,
  });
};

source.getComments = function (url) {
  return new CommentPager([], false, {});
};

source.getSubComments = function (comment) {
  return new CommentPager([], false, {});
};

//================ HELPER FUNCTIONS ================//

function fetchHTML(path) {
  const resp = http.GET(BASE_URL + path, {}, false);
  if (!resp.isOk) {
    throw new ScriptException(`HTTP request failed: ${resp.code}`);
  }

  const dom = domParser.parseFromString(resp.body);
  return dom;
}

function extractTitleFromUrl(url) {
  const pattern = new RegExp(`/${CONTENT_TYPE}/stream/([^/\\?]+)`);
  const match = url.match(pattern);
  return match ? match[1] : "";
}

function extractTitleFromPath(path) {
  return path
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toRelativePath(text) {
  text = text.toLowerCase();
  const replacements = [
    ":",
    ",",
    "(",
    ")",
    "~",
    ".",
    "&",
    "'",
    "+",
    "!",
    "ü",
    "ä",
    "ö",
  ];
  let result = "";
  let lastWasDash = false;

  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    if (replacements.indexOf(c) !== -1) continue;
    if (c === " ") {
      if (!lastWasDash) {
        result += "-";
        lastWasDash = true;
      }
      continue;
    }
    if (c === "ß") {
      result += "ss";
      lastWasDash = false;
      continue;
    }
    result += c;
    lastWasDash = false;
  }

  return result;
}

function toMediaLanguage(text) {
  if (!text || text.length < 15) {
    return { audio: "Unknown", subtitle: null };
  }

  const languageData = text
    .slice(11, -4)
    .split("-")
    .filter(function (x) {
      return x;
    });

  if (languageData.length === 1) {
    return { audio: toLanguage(languageData[0]), subtitle: null };
  }
  if (languageData.length === 2) {
    return {
      audio: toLanguage(languageData[0]),
      subtitle: toLanguage(languageData[1]),
    };
  }

  return { audio: "Unknown", subtitle: null };
}

function toHoster(text) {
  text = text.toLowerCase();
  switch (text) {
    case "voe":
      return "VOE";
    case "doodstream":
      return "Doodstream";
    case "vidoza":
      return "Vidoza";
    case "streamtape":
      return "Streamtape";
    case "vidmoly":
      return "Vidmoly";
    default:
      return "Unknown";
  }
}

function toLanguage(text) {
  text = text.toLowerCase();
  switch (text) {
    case "german":
    case "deutsch":
      return "German";
    case "germansub":
      return "GermanSub";
    case "english":
    case "englisch":
      return "English";
    case "englishsub":
      return "EnglishSub";
    default:
      return "Unknown";
  }
}

function searchContent(query) {
  try {
    const dom = fetchHTML("/search?q=" + encodeURIComponent(query));
    const results = [];

    const links = dom.querySelectorAll("li > a");
    for (let i = 0; i < links.length; i++) {
      const a = links[i];
      const url = a.getAttribute("href");
      const em = a.querySelector("em");
      const title = em ? em.textContent : "";

      if (url && title) {
        const img = a.querySelector("img");
        const thumbnail = img
          ? img.getAttribute("data-src") || img.getAttribute("src")
          : "";

        results.push(
          new PlatformVideo({
            id: new PlatformID(PLATFORM, url, config.id),
            name: title,
            thumbnails: new Thumbnails(
              thumbnail ? [new Thumbnail(thumbnail, 0)] : []
            ),
            author: new PlatformAuthorLink(
              new PlatformID(PLATFORM, url, config.id),
              title,
              BASE_URL + url,
              thumbnail
            ),
            uploadDate: 0,
            duration: 0,
            viewCount: 0,
            url: BASE_URL + url,
            isLive: false,
          })
        );
      }
    }

    return results;
  } catch (e) {
    log("Error in searchContent: " + e);
    return [];
  }
}

function getSeriesInfo(titlePath) {
  try {
    const dom = fetchHTML(`/${CONTENT_TYPE}/stream/${titlePath}`);

    if (dom.querySelector(".messageAlert.danger")) {
      throw new ScriptException("Series not found");
    }

    const titleElement = dom.querySelector(".series-title h1, h1");
    const descElement = dom.querySelector("p.seri_des, .description");
    const imgElement = dom.querySelector(".seriesCoverBox img, .cover img");

    const thumbnail = imgElement
      ? imgElement.getAttribute("data-src") || imgElement.getAttribute("src")
      : "";

    return {
      title: titleElement
        ? titleElement.textContent.trim()
        : extractTitleFromPath(titlePath),
      description: descElement
        ? descElement.getAttribute("data-full-description") ||
          descElement.textContent.trim()
        : "",
      thumbnail: thumbnail
        ? thumbnail.indexOf("http") === 0
          ? thumbnail
          : BASE_URL + thumbnail
        : "",
      banner: thumbnail
        ? thumbnail.indexOf("http") === 0
          ? thumbnail
          : BASE_URL + thumbnail
        : "",
    };
  } catch (e) {
    log("Error in getSeriesInfo: " + e);
    return {
      title: extractTitleFromPath(titlePath),
      description: "",
      thumbnail: "",
      banner: "",
    };
  }
}

function getAllEpisodes(titlePath) {
  const allEpisodes = [];

  for (let season = 1; season <= 20; season++) {
    try {
      const episodes = getEpisodesFromSeason(titlePath, season);
      if (episodes.length > 0) {
        allEpisodes.push.apply(allEpisodes, episodes);
      } else {
        break;
      }
    } catch (e) {
      break;
    }
  }

  return allEpisodes;
}

function getEpisodesFromSeason(titlePath, season) {
  try {
    const dom = fetchHTML(
      `/${CONTENT_TYPE}/stream/${titlePath}/staffel-${season}`
    );

    const episodes = [];
    const rows = dom.querySelectorAll(
      "table.seasonEpisodesList tbody tr, .episodes-list tr"
    );

    for (let i = 0; i < rows.length; i++) {
      const tr = rows[i];
      const numElement = tr.querySelector("td a, .episode-number");
      const titleElement = tr.querySelector(
        "td:nth-child(2) strong, .episode-title"
      );

      if (numElement) {
        const episodeNum = parseInt(numElement.textContent.trim());
        const episodeTitle = titleElement
          ? titleElement.textContent.trim()
          : "";

        episodes.push(
          new PlatformVideo({
            id: new PlatformID(
              PLATFORM,
              `${titlePath}-s${season}e${episodeNum}`,
              config.id
            ),
            name: episodeTitle
              ? `S${season}E${episodeNum}: ${episodeTitle}`
              : `S${season}E${episodeNum}`,
            thumbnails: new Thumbnails([]),
            author: new PlatformAuthorLink(
              new PlatformID(PLATFORM, titlePath, config.id),
              extractTitleFromPath(titlePath),
              `${BASE_URL}/${CONTENT_TYPE}/stream/${titlePath}`,
              ""
            ),
            uploadDate: 0,
            duration: 0,
            viewCount: 0,
            url: `${BASE_URL}/${CONTENT_TYPE}/stream/${titlePath}/staffel-${season}/episode-${episodeNum}`,
            isLive: false,
          })
        );
      }
    }

    return episodes;
  } catch (e) {
    log("Error in getEpisodesFromSeason: " + e);
    return [];
  }
}

function getEpisodeInfo(titlePath, season, episodeNum) {
  try {
    const dom = fetchHTML(
      `/${CONTENT_TYPE}/stream/${titlePath}/staffel-${season}/episode-${episodeNum}`
    );

    if (!dom.querySelector("ul.row li, .hoster-list li")) {
      throw new ScriptException("Episode not found");
    }

    const titleElement = dom.querySelector("h1, .episode-title");
    const descElement = dom.querySelector(".episode-description, .description");

    const languageMapping = {};
    const langImages = dom.querySelectorAll(
      "div.changeLanguageBox img, .language-selector img"
    );
    for (let i = 0; i < langImages.length; i++) {
      const img = langImages[i];
      const key = parseInt(img.getAttribute("data-lang-key"));
      const src = img.getAttribute("src");
      if (!isNaN(key) && src) {
        languageMapping[key] = toMediaLanguage(src);
      }
    }

    const streams = [];
    const listItems = dom.querySelectorAll("ul.row li, .hoster-list li");
    for (let i = 0; i < listItems.length; i++) {
      const li = listItems[i];
      const langKey = parseInt(li.getAttribute("data-lang-key"));
      const watchLink = li.querySelector("a.watchEpisode, a.watch-link");
      const hosterElement = li.querySelector("h4, .hoster-name");

      if (watchLink) {
        const href = watchLink.getAttribute("href");
        streams.push({
          videoUrl: href
            ? href.indexOf("http") === 0
              ? href
              : BASE_URL + href
            : "",
          hoster: hosterElement ? hosterElement.textContent.trim() : "Unknown",
          language: languageMapping[langKey] || {
            audio: "Unknown",
            subtitle: null,
          },
        });
      }
    }

    return {
      name: titleElement ? titleElement.textContent.trim() : "",
      description: descElement ? descElement.textContent.trim() : "",
      duration: 0,
      streams: streams,
    };
  } catch (e) {
    log("Error in getEpisodeInfo: " + e);
    return {
      name: "",
      description: "",
      duration: 0,
      streams: [],
    };
  }
}

log("LOADED");
