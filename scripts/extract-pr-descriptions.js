#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { parse } = require('node-html-parser')
const { execSync } = require('child_process')
// root of the repository
const repoRoot = path.resolve(__dirname, '..')

// ----------------------------
// Simple CLI arg parsing
// ----------------------------
function parseArgs() {
  const args = process.argv.slice(2)
  const result = { repoArg: null, fetchRemote: false }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--repo' || a === '-r') {
      const v = args[i + 1]
      if (v && !v.startsWith('-')) {
        result.repoArg = v
        i++
      }
    } else if (a.startsWith('--repo=')) {
      result.repoArg = a.split('=')[1]
    } else if (a === '--fetch-remote' || a === '--remote') {
      result.fetchRemote = true
    } else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: node scripts/extract-pr-descriptions.js [--repo owner/repo|url] [--fetch-remote]'
      )
      process.exit(0)
    }
  }
  return result
}

// Load env files following project script pattern: prefer .env.local over .env
try {
  const dotenv = require('dotenv')
  const envLocal = path.join(repoRoot, '.env.local')
  const envFile = path.join(repoRoot, '.env')
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal })
  } else if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile })
  }
} catch (e) {
  // ignore if dotenv is not available
}

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim()
  } catch (err) {
    return ''
  }
}

function parseOwnerRepo(remoteUrl) {
  if (!remoteUrl) return null
  // normalize git@github.com:owner/repo.git -> https://github.com/owner/repo.git
  if (remoteUrl.startsWith('git@')) {
    remoteUrl = remoteUrl.replace(':', '/').replace('git@', 'https://')
  }
  const m = remoteUrl.match(/github.com[:\/]([^\/]+)\/([^\/]+?)(?:\.git)?$/i)
  if (!m) return null
  return { owner: m[1], repo: m[2] }
}

function findMergeCommits() {
  // Use a structured format so parsing is stable even with newlines
  const fmt = '%H%x1f%an%x1f%ad%x1f%s%x1f%b%x1e' // record separator 0x1e, field sep 0x1f
  const raw = runGit(
    `git -C "${repoRoot}" log --merges --pretty=format:'${fmt}' --date=iso`
  )
  if (!raw) return []
  const records = raw
    .split('\x1e')
    .map((r) => r.trim())
    .filter(Boolean)
  const commits = []
  for (const rec of records) {
    const parts = rec.split('\x1f')
    const [hash, author, date, subject, body] = parts
    commits.push({
      hash,
      author,
      date,
      subject: subject || '',
      body: body || ''
    })
  }
  return commits
}

function extractPrNumber(subject, body) {
  const prRegexes = [
    /Merge pull request #(\d+)/i,
    /pull request #(\d+)/i,
    /pull request (\d+)/i,
    /#(\d+)\b/ // fallback: first standalone number with #
  ]
  for (const r of prRegexes) {
    let m = subject && subject.match(r)
    if (m) return m[1]
    m = body && body.match(r)
    if (m) return m[1]
  }
  return null
}

async function fetchPrData(owner, repo, prNumber, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`
  const headers = { 'User-Agent': 'extract-pr-descriptions-script' }
  if (githubToken) headers.Authorization = `token ${githubToken}`
  try {
    const res = await axios.get(url, { headers })
    return res.data
  } catch (err) {
    // return null to indicate fallback
    return null
  }
}

function fetchPrDataGh(owner, repo, prNumber) {
  try {
    // Try to use gh CLI to get PR data as JSON. Requires gh to be installed and authenticated.
    const cmd = `gh pr view ${prNumber} --repo ${owner}/${repo} --json number,title,body,author,mergedAt,url`
    const out = execSync(cmd, { encoding: 'utf8' }).trim()
    if (!out) return null
    const data = JSON.parse(out)
    return {
      number: data.number,
      title: data.title,
      body: data.body,
      user: data.author || null,
      created_at: null,
      merged_at: data.mergedAt || null,
      html_url:
        data.url || `https://github.com/${owner}/${repo}/pull/${prNumber}`
    }
  } catch (e) {
    return null
  }
}

async function fetchIssueComments(owner, repo, issueNumber, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`
  const headers = { 'User-Agent': 'extract-pr-descriptions-script' }
  if (githubToken) headers.Authorization = `token ${githubToken}`
  try {
    const res = await axios.get(url, { headers })
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    return []
  }
}

async function fetchPrReviewComments(owner, repo, prNumber, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/comments`
  const headers = { 'User-Agent': 'extract-pr-descriptions-script' }
  if (githubToken) headers.Authorization = `token ${githubToken}`
  try {
    const res = await axios.get(url, { headers })
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    return []
  }
}

async function fetchIssueTimeline(owner, repo, issueNumber, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/timeline?per_page=100`
  // timeline requires a preview accept header in some API versions
  const headers = {
    'User-Agent': 'extract-pr-descriptions-script',
    Accept:
      'application/vnd.github+json, application/vnd.github.mockingbird-preview+json'
  }
  if (githubToken) headers.Authorization = `token ${githubToken}`
  try {
    const res = await axios.get(url, { headers })
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    return []
  }
}

async function fetchPrHtmlFirstComment(owner, repo, prNumber, githubToken) {
  const url = `https://github.com/${owner}/${repo}/pull/${prNumber}`
  const headers = {
    'User-Agent': 'extract-pr-descriptions-script',
    Accept: 'text/html'
  }
  if (githubToken) headers.Authorization = `token ${githubToken}`
  try {
    const res = await axios.get(url, { headers })
    const html = res.data
    const root = parse(html)
    // aggressive scraping strategy:
    // 1) collect candidate blocks from a wide set of selectors used in GitHub PR pages
    const selectors = [
      '#discussion_bucket',
      '.js-discussion',
      '.discussion-timeline',
      '.comment-body',
      '.js-comment-body',
      '.markdown-body',
      '.timeline-comment',
      '.discussion-item-body',
      'article',
      '.comment',
      '.edit-comment-hide',
      '[data-test-selector="comment-body"]'
    ]

    const blocks = []
    for (const sel of selectors) {
      const nodes = root.querySelectorAll(sel) || []
      for (const n of nodes) {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim()
        if (txt && txt.length > 30)
          blocks.push({ text: txt, len: txt.length, selector: sel })
      }
    }

    // Also try grouping consecutive paragraphs inside discussion containers
    const containers =
      root.querySelectorAll(
        '#discussion_bucket, .js-discussion, .discussion-timeline'
      ) || []
    for (const c of containers) {
      const ps = c.querySelectorAll('p') || []
      if (ps.length) {
        // build paragraph groups of up to 6 paragraphs to find larger blocks
        for (let i = 0; i < ps.length; i++) {
          let group = ''
          for (let j = i; j < Math.min(ps.length, i + 6); j++) {
            group +=
              (ps[j].textContent || '').replace(/\s+/g, ' ').trim() + '\n\n'
            const g = group.trim()
            if (g.length > 60)
              blocks.push({ text: g, len: g.length, selector: 'p-group' })
          }
        }
      }
    }

    // If no blocks found, as a last resort grab the entire discussion text
    if (!blocks.length) {
      const discussion =
        root.querySelector('#discussion_bucket') ||
        root.querySelector('.js-discussion') ||
        root
      const full = ((discussion && discussion.textContent) || '')
        .replace(/\s+/g, ' ')
        .trim()
      return full && full.length > 40 ? full : null
    }

    // pick the largest block (most likely the full PR description or big comment)
    blocks.sort((a, b) => b.len - a.len)
    return blocks[0].text
  } catch (err) {
    return null
  }
}

async function main() {
  const cli = parseArgs()
  console.log('Scanning repository for merge commits and PR numbers...')

  // allow overriding the repo via CLI --repo owner/repo or full URL
  let repo = null
  if (cli.repoArg) {
    // if user passed owner/repo, split; otherwise try parseOwnerRepo
    if (/^[^\/]+\/[^\/]+$/.test(cli.repoArg)) {
      const [owner, r] = cli.repoArg.split('/')
      repo = { owner, repo: r }
    } else {
      repo = parseOwnerRepo(cli.repoArg)
    }
    if (!repo)
      console.warn(
        'Could not parse --repo argument; continuing without remote links.'
      )
  } else {
    const remoteUrl =
      runGit(`git -C "${repoRoot}" remote get-url origin`) ||
      runGit(`git -C "${repoRoot}" remote get-url`)
    repo = parseOwnerRepo(remoteUrl)
    if (!repo)
      console.warn('Could not parse remote URL; PR links will be omitted.')
  }
  if (!repo)
    console.warn('Could not parse remote URL; PR links will be omitted.')

  // determine local git user name to filter merges authored by you
  const gitUserNameRaw = runGit(`git -C "${repoRoot}" config user.name`)
  const gitUserName = gitUserNameRaw
    ? gitUserNameRaw.trim().toLowerCase()
    : null
  if (!gitUserName)
    console.log(
      'Warning: could not determine local git user.name; no author filtering will be applied.'
    )

  const commits = findMergeCommits()
  if (!commits.length) {
    // If fetchRemote is requested and no local merges were found, try remote PR listing
    if (cli.fetchRemote && repo) {
      console.log(
        'No local merge commits found; attempting to fetch merged PRs from remote via GitHub API...'
      )
      // We'll rely on list pulls API to enumerate merged PRs
      const githubToken =
        process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null
      try {
        const headers = { 'User-Agent': 'extract-pr-descriptions-script' }
        if (githubToken) headers.Authorization = `token ${githubToken}`
        const pullsUrl = `https://api.github.com/repos/${repo.owner}/${repo.repo}/pulls?state=closed&per_page=100`
        const res = await axios.get(pullsUrl, { headers })
        const data = Array.isArray(res.data) ? res.data : []
        // filter merged PRs
        const merged = data.filter((p) => p.merged_at)
        // create commit-like entries for the merged PRs
        const commitsFromRemote = merged.map((p) => ({
          hash: `remote-pr-${p.number}`,
          author: (p.user && p.user.login) || '',
          date: p.merged_at,
          subject: p.title,
          body: p.body || '',
          prNumber: p.number
        }))
        // continue using these as the commits list
        // Note: author filtering by local git user is not applicable when fetching remote PRs; we'll include all unless git user matches the PR author login
        // replace commits variable
        // eslint-disable-next-line no-unused-vars
        // reuse commits variable name by shadowing in function scope
        // but to keep consistent we assign to a new variable and later use it
        // set commitsRemote var
        var commitsRemote = commitsFromRemote
        // proceed using commitsRemote
        // build prMap from commitsRemote
        const prMap = new Map()
        for (const c of commitsRemote) {
          const prNumber = c.prNumber || extractPrNumber(c.subject, c.body)
          if (prNumber) {
            if (!prMap.has(prNumber))
              prMap.set(prNumber, { prNumber, commit: c })
          } else {
            const key = `merge:${c.hash}`
            prMap.set(key, { prNumber: null, commit: c })
          }
        }

        // proceed with existing logic but using prMap
        // copy-paste of downstream processing but scoped here to reuse previous functions
        const githubTokenInner =
          process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null
        const entries = []
        for (const [key, val] of prMap.entries()) {
          if (val.prNumber) {
            let prData = null
            if (repo && githubTokenInner)
              prData = await fetchPrData(
                repo.owner,
                repo.repo,
                val.prNumber,
                githubTokenInner
              )
            if (!prData && repo && !githubTokenInner) {
              prData = await fetchPrData(
                repo.owner,
                repo.repo,
                val.prNumber,
                null
              )
            }
            if (!prData && repo)
              prData = fetchPrDataGh(repo.owner, repo.repo, val.prNumber)
            if (prData) {
              let bodyText = prData.body || ''
              if (repo) {
                const issueComments = await fetchIssueComments(
                  repo.owner,
                  repo.repo,
                  val.prNumber,
                  githubTokenInner
                )
                const reviewComments = await fetchPrReviewComments(
                  repo.owner,
                  repo.repo,
                  val.prNumber,
                  githubTokenInner
                )
                const timeline = await fetchIssueTimeline(
                  repo.owner,
                  repo.repo,
                  val.prNumber,
                  githubTokenInner
                )
                const allComments = []
                if (Array.isArray(issueComments))
                  allComments.push(
                    ...issueComments.map((c) => ({
                      type: 'issue',
                      created_at: c.created_at,
                      user: c.user,
                      body: c.body
                    }))
                  )
                if (Array.isArray(reviewComments))
                  allComments.push(
                    ...reviewComments.map((c) => ({
                      type: 'review',
                      created_at: c.created_at,
                      user: c.user,
                      body: c.body
                    }))
                  )
                if (Array.isArray(timeline)) {
                  for (const t of timeline) {
                    if (t && t.event === 'commented' && t.body) {
                      allComments.push({
                        type: 'timeline',
                        created_at: t.created_at || t.created_at,
                        user: t.actor || t.user,
                        body: t.body
                      })
                    }
                    if (t && t.comment && t.comment.body) {
                      allComments.push({
                        type: 'timeline',
                        created_at: t.comment.created_at,
                        user: t.comment.user,
                        body: t.comment.body
                      })
                    }
                  }
                }
                if (allComments.length) {
                  allComments.sort(
                    (a, b) =>
                      new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime()
                  )
                  const normalizedPr = (bodyText || '').trim()
                  const commentBlocks = []
                  for (const c of allComments) {
                    const cb = (c.body || '').trim()
                    if (!cb) continue
                    if (cb === normalizedPr) continue
                    commentBlocks.push(
                      `*(From ${c.type} comment by ${c.user && c.user.login} on ${c.created_at})*\n\n${cb}`
                    )
                  }
                  if (commentBlocks.length) {
                    bodyText =
                      (normalizedPr ? normalizedPr + '\n\n' : '') +
                      commentBlocks.join('\n\n---\n\n')
                  }
                }
              }
              const normalizedFinal = (bodyText || '').trim()
              if (!normalizedFinal) {
                const htmlText = await fetchPrHtmlFirstComment(
                  repo.owner,
                  repo.repo,
                  val.prNumber,
                  githubTokenInner
                )
                if (htmlText) bodyText = htmlText
              }
              entries.push({
                number: val.prNumber,
                title: prData.title,
                author: prData.user && prData.user.login,
                created_at: prData.created_at,
                merged_at: prData.merged_at,
                url: prData.html_url,
                body: bodyText || ''
              })
            } else {
              entries.push({
                number: val.prNumber,
                title: val.commit.subject || `PR ${val.prNumber}`,
                author: val.commit.author,
                merged_at: val.commit.date,
                url: repo
                  ? `https://github.com/${repo.owner}/${repo.repo}/pull/${val.prNumber}`
                  : null,
                body: val.commit.body || ''
              })
            }
          } else {
            entries.push({
              number: null,
              title: val.commit.subject,
              author: val.commit.author,
              merged_at: val.commit.date,
              url: null,
              body: val.commit.body || ''
            })
          }
        }

        entries.sort((a, b) => {
          const da = a.merged_at ? new Date(a.merged_at).getTime() : 0
          const db = b.merged_at ? new Date(b.merged_at).getTime() : 0
          return db - da
        })

        const header =
          `# PR_DESCRIPTIONS for ${repo ? `${repo.owner}/${repo.repo}` : 'remote repo'}\n\n` +
          `Generated: ${new Date().toISOString()}\n\n`
        const lines = [header]
        for (const e of entries) {
          if (e.number) {
            lines.push(`## PR #${e.number}: ${e.title}`)
            if (e.author) lines.push(`- Author: ${e.author}`)
            if (e.merged_at) lines.push(`- Merged: ${e.merged_at}`)
            if (e.url) lines.push(`- Link: ${e.url}`)
          } else {
            lines.push(`## Merge commit: ${e.title}`)
            if (e.author) lines.push(`- Author: ${e.author}`)
            if (e.merged_at) lines.push(`- Date: ${e.merged_at}`)
          }
          lines.push('\n')
          lines.push(e.body || '_No description found._')
          lines.push('\n---\n')
        }
        // ensure reports directory exists
        const reportsDir = path.join(repoRoot, 'reports')
        try {
          fs.mkdirSync(reportsDir, { recursive: true })
        } catch (e) {
          /* ignore */
        }
        const safeRepoSegmentInner = repo
          ? `${repo.owner}_${repo.repo}`
          : 'remote'
        const filenameInner =
          cli && cli.fetchRemote
            ? `PR_DESCRIPTIONS_${safeRepoSegmentInner}_remote.md`
            : 'PR_DESCRIPTIONS.md'
        const outPath = path.join(reportsDir, filenameInner)
        fs.writeFileSync(outPath, lines.join('\n'), 'utf8')
        console.log(`Wrote ${outPath} (${entries.length} entries)`)
        return
      } catch (err) {
        console.warn(
          'Remote fetch of PRs failed, falling back to local merge scanning. Error:',
          err && err.message ? err.message : err
        )
      }
    }
    console.log('No merge commits found. Exiting.')
    return
  }

  const prMap = new Map()
  for (const c of commits) {
    // If the user explicitly requested fetching remote PRs, we shouldn't strictly filter by local git user
    if (!cli.fetchRemote) {
      // filter: only include commits authored by the local git user (if known)
      const commitAuthor = (c.author || '').trim().toLowerCase()
      if (gitUserName && commitAuthor !== gitUserName) {
        continue // skip merges not authored by you
      }
    }
    const prNumber = c.prNumber || extractPrNumber(c.subject, c.body)
    if (prNumber) {
      if (!prMap.has(prNumber)) prMap.set(prNumber, { prNumber, commit: c })
    } else {
      // store under special key to possibly include as orphan merges
      const key = `merge:${c.hash}`
      prMap.set(key, { prNumber: null, commit: c })
    }
  }

  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null

  const entries = []
  for (const [key, val] of prMap.entries()) {
    if (val.prNumber) {
      let prData = null
      if (repo && githubToken)
        prData = await fetchPrData(
          repo.owner,
          repo.repo,
          val.prNumber,
          githubToken
        )
      if (!prData && repo && !githubToken) {
        // try without token but may be rate limited
        prData = await fetchPrData(repo.owner, repo.repo, val.prNumber, null)
      }
      if (!prData && repo) {
        // try gh CLI fallback (requires gh installed and authenticated)
        prData = fetchPrDataGh(repo.owner, repo.repo, val.prNumber)
      }
      if (prData) {
        // start with the PR body
        let bodyText = prData.body || ''
        // always fetch issue comments and review comments, combine them and append (ordered by date)
        if (repo) {
          const issueComments = await fetchIssueComments(
            repo.owner,
            repo.repo,
            val.prNumber,
            githubToken
          )
          const reviewComments = await fetchPrReviewComments(
            repo.owner,
            repo.repo,
            val.prNumber,
            githubToken
          )
          const timeline = await fetchIssueTimeline(
            repo.owner,
            repo.repo,
            val.prNumber,
            githubToken
          )
          const allComments = []
          if (Array.isArray(issueComments))
            allComments.push(
              ...issueComments.map((c) => ({
                type: 'issue',
                created_at: c.created_at,
                user: c.user,
                body: c.body
              }))
            )
          if (Array.isArray(reviewComments))
            allComments.push(
              ...reviewComments.map((c) => ({
                type: 'review',
                created_at: c.created_at,
                user: c.user,
                body: c.body
              }))
            )
          if (Array.isArray(timeline)) {
            // timeline items can contain different shapes; include those with a 'body' or 'comment' text
            for (const t of timeline) {
              if (t && t.event === 'commented' && t.body) {
                allComments.push({
                  type: 'timeline',
                  created_at: t.created_at || t.created_at,
                  user: t.actor || t.user,
                  body: t.body
                })
              }
              // some timeline items embed a 'commit_id' or 'source' with body; attempt to extract common fields
              if (t && t.comment && t.comment.body) {
                allComments.push({
                  type: 'timeline',
                  created_at: t.comment.created_at,
                  user: t.comment.user,
                  body: t.comment.body
                })
              }
            }
          }
          if (allComments.length) {
            // sort by created_at asc
            allComments.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            // build a combined block but avoid duplicating when identical to PR body
            const normalizedPr = (bodyText || '').trim()
            const commentBlocks = []
            for (const c of allComments) {
              const cb = (c.body || '').trim()
              if (!cb) continue
              if (cb === normalizedPr) continue // skip identical
              commentBlocks.push(
                `*(From ${c.type} comment by ${c.user && c.user.login} on ${c.created_at})*\n\n${cb}`
              )
            }
            if (commentBlocks.length) {
              bodyText =
                (normalizedPr ? normalizedPr + '\n\n' : '') +
                commentBlocks.join('\n\n---\n\n')
            }
          }
        }

        // if we still don't have meaningful content, try HTML fallback (scrape PR page)
        const normalizedFinal = (bodyText || '').trim()
        if (!normalizedFinal) {
          const htmlText = await fetchPrHtmlFirstComment(
            repo.owner,
            repo.repo,
            val.prNumber,
            githubToken
          )
          if (htmlText) bodyText = htmlText
        }

        entries.push({
          number: val.prNumber,
          title: prData.title,
          author: prData.user && prData.user.login,
          created_at: prData.created_at,
          merged_at: prData.merged_at,
          url: prData.html_url,
          body: bodyText || ''
        })
      } else {
        // fallback to merge commit message
        entries.push({
          number: val.prNumber,
          title: val.commit.subject || `PR ${val.prNumber}`,
          author: val.commit.author,
          merged_at: val.commit.date,
          url: repo
            ? `https://github.com/${repo.owner}/${repo.repo}/pull/${val.prNumber}`
            : null,
          body: val.commit.body || ''
        })
      }
    } else {
      // orphan merge commit - include as note
      entries.push({
        number: null,
        title: val.commit.subject,
        author: val.commit.author,
        merged_at: val.commit.date,
        url: null,
        body: val.commit.body || ''
      })
    }
  }

  // sort entries by merged_at descending (if available)
  entries.sort((a, b) => {
    const da = a.merged_at ? new Date(a.merged_at).getTime() : 0
    const db = b.merged_at ? new Date(b.merged_at).getTime() : 0
    return db - da
  })

  const header =
    `# PR_DESCRIPTIONS for ${repo ? `${repo.owner}/${repo.repo}` : 'local repo'}\n\n` +
    `Generated: ${new Date().toISOString()}\n\n`

  const lines = [header]
  for (const e of entries) {
    if (e.number) {
      lines.push(`## PR #${e.number}: ${e.title}`)
      if (e.author) lines.push(`- Author: ${e.author}`)
      if (e.merged_at) lines.push(`- Merged: ${e.merged_at}`)
      if (e.url) lines.push(`- Link: ${e.url}`)
    } else {
      lines.push(`## Merge commit: ${e.title}`)
      if (e.author) lines.push(`- Author: ${e.author}`)
      if (e.merged_at) lines.push(`- Date: ${e.merged_at}`)
    }
    lines.push('\n')
    lines.push(e.body || '_No description found._')
    lines.push('\n---\n')
  }

  // ensure reports directory exists
  const reportsDir = path.join(repoRoot, 'reports')
  try {
    fs.mkdirSync(reportsDir, { recursive: true })
  } catch (e) {
    /* ignore */
  }

  // choose output filename; when fetch-remote was requested, add repo and remote suffix
  const safeRepoSegment = repo ? `${repo.owner}_${repo.repo}` : 'local'
  const filename =
    cli && cli.fetchRemote
      ? `PR_DESCRIPTIONS_${safeRepoSegment}_remote.md`
      : 'PR_DESCRIPTIONS.md'
  const outPath = path.join(reportsDir, filename)
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8')
  console.log(`Wrote ${outPath} (${entries.length} entries)`)
}

main().catch((err) => {
  console.error('Error:', err && err.message ? err.message : err)
  process.exit(1)
})
