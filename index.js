const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear } = require('mineflayer-pathfinder').goals

let bots = [];
let logger = null;
let win;

ipcMain.on("message", (e, msg) => {
    bots.forEach(bot => {
        bot.chat(msg);
    })
})

ipcMain.on("editcon", editCon);

let autochat = false;
let autochat_delay = 0;
let autochat_msg = "";
let killaura = false;
let killaura_f = false;
let joincmd_delay = 0;
let joincmd_msg = "";
let joincmd = false;

let crr = 0;
setInterval(() => {
    if(!autochat) return;

    if(crr >= autochat_delay) {
        crr = 0;
        bots.forEach((bot) => {
            bot.chat(autochat_msg);
        })
    }

    crr+=1000;
}, 1000);

function editCon(e, opts) {
    killaura = opts.killaura;
    killaura_f = opts.killaura_f;
    autochat = opts.autochat;
    joincmd = opts.joincmd;
    joincmd_msg = opts.joincmd_msg;
    joincmd_delay = opts.joincmd_delay;
    if(opts.autochat) {
        autochat = opts.autochat;
        autochat_delay = opts.autochat_delay;
        autochat_msg = opts.autochat_msg;
    }
    bots.forEach(async (bot) => {
        bot.setControlState("forward", opts.autowalk_forward);
        bot.setControlState("back", opts.autowalk_back);
        bot.setControlState("left", opts.autowalk_left);
        bot.setControlState("right", opts.autowalk_right);

        bot.setControlState("jump", opts.autojump)
    })
}

ipcMain.on("createbot", (event, sla) => {
    editCon(null, sla);
    let bot = mineflayer.createBot({
        host: sla.host,
        username: nums(sla.username),
        port: sla.port
    });
    bot.attacking = false;
    bot.loadPlugin(pathfinder);

    bot.on("end", (err) => {
        win.webContents.send("log", `${bot.username} End > ${err}`);

        bots.slice(bots.findIndex(b => b.username == bot.username), bots.findIndex(b => b.username == bot.username));

        if(logger== bot.username) {
            if(bots.length >= 1) logger = bots[0].username;
            else logger = null;
        }
    });
    bot.on("kicked", (err) => win.webContents.send("log", `${bot.username} Kicked > ${err}`))
    bot.on("death", (err) => win.webContents.send("log", `${bot.username} Death > ${err}`))
    bot.on("error", (err) => win.webContents.send("log", `${bot.username} Error > ${err}`))
    bot.on("whisper", (from, msg) => win.webContents.send("log", `${bot.username} Whisper: ${from}> ${msg}`))
    bot.on("physicsTick", async () => {
        if(killaura) aura(bot);
    })
    bot.on("login", async () => {
        bot.defaultMove = new Movements(bot);
        bots.push(bot);
        win.webContents.send("log", `Bot id [${bots.length + 1}] joined in the server. | ${bot.username}`);
        console.log(`Bot id [${bots.length + 1}] joined in the server. | ${bot.username}`);
        if(bots.length <= 0) logger = bot.username;
        if(joincmd) {
            await timeout(joincmd_delay);
            bot.chat(joincmd_msg);
        }

    })

    bot.on("chat", (from, msg) => {
        if(bots.map(b => b.username).includes(from)) return;
        if(logger == bot.username) win.webContents.send("log", `Chat: ${from}> ${msg}`)
    });
})

function timeout(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    })
}

ipcMain.on("window", (e, a) => {
    switch(a) {
        case 0:
            win.close();
        break;
        case 1:
            if(win.isMaximized()) win.unmaximize()
            else win.maximize();
        break;
        case 2:
            win.minimize();
        break;
    }
})
function nums(str) {
    for(let i = 0 ; i < str.length ; i++) {
        str = str.replace("%", Math.floor(Math.random() * 9));
    }
    return str;
}
function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 750,
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js")
    },
    frame: false
  })
  win.setMenuBarVisibility(false)
  win.loadFile('./page/index.html');
  
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function aura(bot) {
    const filter = e => e.position.distanceTo(bot.entity.position) < (killaura_f ? 5 : 3.5) && (e.type == "player" || e.type == "mob") && e.mobType !== 'Armor Stand'
    const entity = bot.nearestEntity(filter)
    if (entity) {
        if(killaura_f) {
            let p = entity.position;
            bot.pathfinder.setMovements(bot.defaultMove)
            bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 0))
        }
        if(!bot.attacking){
            bot.attacking = true
            if (entity) {
                bot.setControlState('jump', true)
                bot.lookAt(entity.position)
                setTimeout(function (){
                    bot.lookAt(entity.position)
                    bot.attack(entity);
                    bot.setControlState('jump', false)
                    bot.attacking = false;
                }, 200)
            }
        }
    }
}