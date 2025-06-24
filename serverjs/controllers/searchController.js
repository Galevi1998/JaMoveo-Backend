const axios = require("axios");
const cheerio = require("cheerio");

exports.searchSongs = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const url = `https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(
      query
    )}`;
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const results = [];

    $("tr").each((_, el) => {
        const aTag = $(el).find("a.ruSongLink"); 
        const title = $(el).find(".sNameI19").text().trim();
        const artist = $(el).find(".aNameI19").text().trim();
        const href = aTag.attr("href");
      
        const styleAttr = $(el).find("span.ruArtPhoto").attr("style");
        let image = null;
      
        if (styleAttr) {
          const match = styleAttr.match(/url\(([^)]+)\)/);
          if (match && match[1]) {
            image = `https://www.tab4u.com${match[1]}`;
          }
        }
      
        if (href && title) {
          results.push({
            title: `${title} - ${artist}`,
            artist,
            url: `https://www.tab4u.com/${href}`,
            image,
          });
        }
      });
      

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch search results" });
  }
};

exports.scrapeSongPage = async (req, res) => {
    const { url } = req.body;
    if (!url || !url.startsWith("https://www.tab4u.com/tabs/songs/")) {
      return res.status(400).json({ error: "Invalid or missing URL" });
    }
  
    try {
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);
      const finalResult = [];
  
      const rows = $("table tr").toArray();
  
      for (let i = 0; i < rows.length - 1; i++) {
        const chordRow = rows[i];
        const lyricRow = rows[i + 1];
  
        const chordEn = $(chordRow).find("td.chords_en");
        const chordTd = chordEn.length ? chordEn : $(chordRow).find("td.chords");
        const lyricTd = $(lyricRow).find("td.song");
  
        if (!chordTd.length || !lyricTd.length) continue;
  
        const chords = chordTd
          .find("span")
          .map((_, span) => $(span).text().trim())
          .get()
          .filter((txt) => txt);
  
        const rawLyric = lyricTd
          .text()
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();
  
        const lyrics = rawLyric.split(" ").filter(Boolean);
  
        const isHebrew = /[\u0590-\u05FF]/.test(rawLyric);
  
        if (isHebrew) {
          lyrics.reverse();
        }
  
        const line = [];
        const max = Math.max(chords.length, lyrics.length);
        for (let j = 0; j < max; j++) {
          const word = lyrics[j] || "";
          const chord = chords[j] || null;
          if (chord) {
            line.push({ lyrics: word, chords: chord });
          } else {
            line.push({ lyrics: word });
          }
        }
  
        finalResult.push(line);
        i++; 
      }
  
      res.json(finalResult);
    } catch (err) {
      res.status(500).json({ error: "Failed to scrape song page" });
    }
  };
  