#!/usr/bin/env node
require('dotenv').config()
const axios = require('axios')

const token = process.env.GITHUB_TOKEN
const owner = 'luismtns'
const repo = 'omentejovem'
const pr = 7
const headers = { 'User-Agent': 'diag-script' }
if (token) headers.Authorization = `token ${token}`

;(async () => {
  try {
    console.log(
      'GITHUB_TOKEN present:',
      !!token,
      token ? `length=${token.length}` : 'none'
    )
    // check repo access
    try {
      const repoInfo = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`,
        { headers }
      )
      console.log('repo.access.ok:', repoInfo.status)
    } catch (re) {
      console.log(
        'repo.access.err:',
        re.response && re.response.status,
        re.response && re.response.data && re.response.data.message
      )
    }

    // check user (token scopes)
    try {
      const userInfo = await axios.get('https://api.github.com/user', {
        headers
      })
      console.log('user.ok: login=', userInfo.data && userInfo.data.login)
    } catch (ue) {
      console.log(
        'user.err:',
        ue.response && ue.response.status,
        ue.response && ue.response.data && ue.response.data.message
      )
    }

    const prd = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pr}`,
      { headers }
    )
    console.log('PR.body.len=', (prd.data.body || '').length)
    console.log('PR.body.preview:\n', (prd.data.body || '').slice(0, 2000))

    const ic = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues/${pr}/comments`,
      { headers }
    )
    console.log('issue.comments.count=', ic.data.length)
    ic.data.forEach((c, i) =>
      console.log(`issue.comments[${i}].len=`, (c.body || '').length)
    )

    const rc = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pr}/comments`,
      { headers }
    )
    console.log('review.comments.count=', rc.data.length)
    rc.data.forEach((c, i) =>
      console.log(`review.comments[${i}].len=`, (c.body || '').length)
    )

    const tl = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues/${pr}/timeline?per_page=100`,
      {
        headers: {
          ...headers,
          Accept: 'application/vnd.github.mockingbird-preview+json'
        }
      }
    )
    console.log('timeline.count=', Array.isArray(tl.data) ? tl.data.length : 0)
    if (Array.isArray(tl.data)) {
      for (let i = 0; i < Math.min(tl.data.length, 10); i++) {
        const t = tl.data[i]
        console.log(
          `timeline[${i}].type=${t.event || t.type || 'n/a'} keys=${Object.keys(t).join(',')}`
        )
        if (t.body)
          console.log(` timeline[${i}].body.len=`, (t.body || '').length)
        if (t.comment && t.comment.body)
          console.log(
            ` timeline[${i}].comment.len=`,
            (t.comment.body || '').length
          )
      }
    }
  } catch (err) {
    console.error(
      'ERR',
      err.response && err.response.status,
      err.response && err.response.data && err.response.data.message,
      err.message
    )
  }
})()
