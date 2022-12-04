
let ambient = {};

var minimize = document.querySelector("#minimize");
var maximize = document.querySelector("#maximize");
var quit = document.querySelector("#quit");

minimize.addEventListener("click", () => {
    window.api.send("window", 2);
});

maximize.addEventListener("click", () => {
    window.api.send("window", 1);
});

quit.addEventListener("click", () => {
    window.api.send("window", 0);
});
let logs = [];

setInterval(() => {
    editConn()
}, 100)

async function editConn() {
    let autochat = document.getElementById("autochat").checked;
    let autowalk_forward = document.getElementById("autowalk_forward").checked;
    let autowalk_back = document.getElementById("autowalk_back").checked;
    let autowalk_left = document.getElementById("autowalk_left").checked;
    let autowalk_right = document.getElementById("autowalk_right").checked;
    let autojump = document.getElementById("autojump").checked;
    let killaura = document.getElementById("killaura").checked;
    let killaura_f = document.getElementById("killaura_follow").checked;

    let joincmd = document.getElementById("joincmd").checked;
    let joincmd_msg = document.getElementById("joincmd_msg").value;
    let joincmd_delay = parseInt(document.getElementById("joincmd_delay").value);

    let opts = {
        autojump, autochat: false, autowalk_forward, autowalk_back, autowalk_left, autowalk_right, killaura, killaura_f, joincmd, joincmd_msg, joincmd_delay
    }

    if(autochat && document.getElementById("autochat_msg").value) {
        opts.autochat = true;
        opts.autochat_delay = parseInt(document.getElementById("autochat_delay").value) || 5000;
        opts.autochat_msg = document.getElementById("autochat_msg").value
    }
    window.api.send("editcon", opts);
}

async function startConn() {
    let host = document.getElementById("server_ip").value;
    let port = document.getElementById("server_port").value;
    let name = document.getElementById("bot_name").value;
    
    let count = document.getElementById("bot_count").value;
    let delay = document.getElementById("join_delay").value;

    let autochat = document.getElementById("autochat").checked;
    let autojump = document.getElementById("autojump").checked;

    let killaura = document.getElementById("killaura").checked;
    let killaura_f = document.getElementById("killaura_follow").checked;

    let autowalk_forward = document.getElementById("autowalk_forward").checked;
    let autowalk_back = document.getElementById("autowalk_back").checked;
    let autowalk_left = document.getElementById("autowalk_left").checked;
    let autowalk_right = document.getElementById("autowalk_right").checked;
    
    let joincmd = document.getElementById("joincmd").checked;
    let joincmd_msg = document.getElementById("joincmd_msg").value;
    let joincmd_delay = parseInt(document.getElementById("joincmd_delay").value);

    let opts = {
        autojump,
        host: host,
        port: parseInt(port),
        username: name, autowalk_forward, autowalk_back, autowalk_left, autowalk_right, killaura, killaura_f, joincmd, joincmd_msg, joincmd_delay
    }

    if(autochat && document.getElementById("autochat_msg").value) {
        opts.autochat = true;
        opts.autochat_delay = document.getElementById("autochat_delay").value || 1000;
        opts.autochat_msg = document.getElementById("autochat_msg").value
    }

    for(let i = 0 ; i < parseInt(count) ; i++) {
        window.api.send("createbot", opts);
        await timeout(parseInt(delay));
    }
}

function timeout(ms) {
    return new Promise(resolve => {setTimeout(() => {resolve()}, ms)});
}

function sendMsg() {
    let msg = document.getElementById("chat_msg");
    if(!msg.value) return;
    window.api.send("message", msg.value);
    document.getElementById("chat_msg").value = "";
    logg("Message sent!");
}

window.api.receive("log", logg);

function logg(log) {
    if(document.getElementById("logs").childNodes.length > 5) {
        document.getElementById("logs").childNodes[0].remove()
    }
    let node = document.createElement("li");
    let textnode = document.createTextNode(log);
    node.appendChild(textnode);
    document.getElementById("logs").appendChild(node);
    if(document.getElementById("logs").childNodes.length > 5) {
        document.getElementById("logs").childNodes[0].remove()
    }
}

// window.api.receive("fromMain", (data) => {
//     console.log(`Received ${data} from main process`);
// });
