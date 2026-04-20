import axios from 'axios';
import Expert from '../models/Expert.js';

const LOCATIONS = ["karnataka", "bengaluru", "bangalore", "mysuru", "mangalore"];

async function getRepoScore(username, keywords) {
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json'
  };
  try {
    const { data: repos } = await axios.get(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=3`,
      { headers, timeout: 10000 }
    );
    let bonus = 0;
    for (const repo of repos) {
      const nameDesc = (repo.name + (repo.description || '')).toLowerCase();
      const topics = (repo.topics || []).map(t => t.toLowerCase());
      if (keywords.some(kw => nameDesc.includes(kw) || topics.includes(kw))) {
        bonus += 15;
      }
    }
    return Math.min(bonus, 50);
  } catch { return 0; }
}

export async function runScraper(keyword, sessionId) {
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json'
  };

  console.log(`🚀 JS SCRAPER STARTED FOR: ${keyword} | SESSION: ${sessionId}`);
  console.log(`📂 SEARCHING DOMAIN: ${keyword.toUpperCase()} (Vetting Limit: 8)`);

  const keywords = [keyword.toLowerCase()];
  const candidatePool = [];
  const seen = new Set();

  for (const loc of LOCATIONS) {
    if (candidatePool.length >= 8) break;
    try {
      const query = `location:${loc} "${keyword}"`;
      const { data } = await axios.get(
        `https://api.github.com/search/users?q=${encodeURIComponent(query)}&sort=followers`,
        { headers }
      );

      for (const user of (data.items || [])) {
        if (candidatePool.length >= 8) break;
        if (seen.has(user.login)) continue;

        const { data: details } = await axios.get(
          `https://api.github.com/users/${user.login}`,
          { headers }
        );

        if ((details.followers || 0) < 5) continue;

        console.log(`  🧪 Vetting ${user.login}...`);

        const repoScore = await getRepoScore(user.login, keywords);
        let score = repoScore + Math.min((details.followers || 0) / 2, 30);
        if (keywords.some(kw => (details.bio || '').toLowerCase().includes(kw))) score += 20;

        candidatePool.push({ details, score });
        seen.add(user.login);
      }
    } catch (err) {
      console.error(`Search error for ${loc}:`, err.message);
    }
  }

  const top5 = candidatePool.sort((a, b) => b.score - a.score).slice(0, 5);

  for (const { details: d, score } of top5) {
    await Expert.findOneAndUpdate(
      { username: d.login },
      {
        name: d.name || d.login,
        username: d.login,
        location: d.location || 'Karnataka',
        profile_url: d.html_url,
        domain: keyword,
        score,
        avatar: d.avatar_url,
        about: d.bio || '',
        linkedin_url: '',
        has_linkedin: false,
        isTemporary: sessionId !== 'none',
        sessionId: sessionId !== 'none' ? sessionId : null,
        scraped_at: new Date()
      },
      { upsert: true, new: true }
    );
    console.log(`    ✅ SAVED: ${d.login} (Score: ${score})`);
  }

  console.log('\n✨ Curation Finished!');
}