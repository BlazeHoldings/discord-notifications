const core = require('@actions/core')
const github = require('@actions/github')
const fetch = require('node-fetch')

async function getContext () {
  const context = github.context
  const payload = context.payload

  const content = {
    body: payload.release.body.length < 1500
      ? payload.release.body
      : payload.release.body.substring(0, 1500) + ` ([...](${payload.release.html_url}))`,
    version: payload.release.tag_name,
    html_url: payload.release.html_url,
    repository_name: payload.repository.full_name
  }

  return content
}

async function run () {
  try {
    const webhookId = core.getInput('webhook_id')
    const webhookToken = core.getInput('webhook_token')

    if (!webhookId || !webhookToken) {
      return core.setFailed('webhook ID or TOKEN are not configured correctly. Verify config file.')
    }

    const content = await getContext()

    const embedMsg = {
      color: 3447003,
      title: `**Mise à jour - ${content.version}**`,
      description: '**Liste des changements (EN)**\n`'+content.body+'`\n**Signification des émojis**\n `🔥 Ajout`, `🔧 Modification`, `🐛 Retrait`',
      footer: {icon_url: 'https://cdn.blazedev.net/blaze.png', text: '• Blaze'},
      timestamp: Date.now()
    }

    const body = {username: 'Mise à jour - Blaze', embeds: [embedMsg] }

    const url = `https://discord.com/api/webhooks/${core.getInput('webhook_id')}/${core.getInput('webhook_token')}?wait=true`

    fetch(url, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => core.info(JSON.stringify(data)))
      .catch(err => core.info(err))
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
