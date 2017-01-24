const spawnSync = require('child_process').spawnSync;
const exec = require('child_process').exec;

const endpoints = [
  'https://uscp.cloud.nifty.com/api/',
  'https://cp.cloud.nifty.com/api/',
];
const commands = {}; 
const regionEndpoint = {};

console.log('Loading commands...');
let r = spawnSync('ls', [`${process.env.NIFTY_CLOUD_HOME}/bin`], {env: process.env});
r.stdout.toString().split("\n").forEach((line)=> {
  if(!line.match(/\.cmd/)) {
    commands[line] = true;
  }
})
console.log('Commands loaded: ', commands);

console.log('Loading regions ...');

endpoints.forEach((endpoint)=> {
  process.env.NIFTY_CLOUD_URL = endpoint;
  let r = spawnSync('nifty-describe-regions', [], {env: process.env});
  r.stdout.toString().split("\n").forEach((line)=> {
    let fields = line.split(/\s+/);
    if(fields.length > 1) {
      let region = fields[1];
      let endpoint = fields[2];
      regionEndpoint[region] = endpoint;
    }
  })
})

console.log('Regions loaded: ', regionEndpoint);

module.exports = (robot)=> {
  robot.respond(/ncccli help( (.+))?/, (message)=> {
    let keyword, lines = ["* nccli help (keyword)"];

    if(message.match[2]) keyword = message.match[2];

    for(command in commands) {
      line = `* nccli [region-name] ${command} (args1 args2)`;
      if(keyword) {
        if(command.match(new RegExp(keyword))) lines.push(line);
      } else {
        lines.push(line);
      }
    }
    message.reply(lines.join("\n"));
  });

  robot.respond(/ncccli ([^\s]+?) ([^\s]+)( (.+))?/, (message)=> {
    let region = message.match[1],
        command = message.match[2],
        args = message.match[4] || "";

    console.log([region, command, args].join(", "))

    if(message.match[1] == 'help') return;
    if(!regionEndpoint[region]) return message.reply("Error: region does not exist");
    if(!commands[command]) return message.reply("Error: command does not exist");

    process.env.NIFTY_CLOUD_URL = `https://${regionEndpoint[region]}/api/`;
    exec(`${command} ${args}`, {env: process.env}, (error, stdout, stderr)=> {
      if(error) return message.reply(error);
      message.reply(stdout);
    });
  })
}
