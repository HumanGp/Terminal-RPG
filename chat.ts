/**
'##::::'##:'##::::'##:'##::::'##::::'###::::'##::: ##::'######:::'########::'########:
 ##:::: ##: ##:::: ##: ###::'###:::'## ##::: ###:: ##:'##... ##:: ##.... ##:... ##..::
 ##:::: ##: ##:::: ##: ####'####::'##:. ##:: ####: ##: ##:::..::: ##:::: ##:::: ##::::
 #########: ##:::: ##: ## ### ##:'##:::. ##: ## ## ##: ##::'####: ########::::: ##::::
 ##.... ##: ##:::: ##: ##. #: ##: #########: ##. ####: ##::: ##:: ##.....:::::: ##::::
 ##:::: ##: ##:::: ##: ##:.:: ##: ##.... ##: ##:. ###: ##::: ##:: ##::::::::::: ##::::
 ##:::: ##:. #######:: ##:::: ##: ##:::: ##: ##::. ##:. ######::: ##::::::::::: ##::::
..:::::..:::.......:::..:::::..::..:::::..::..::::..:::......::::..::::::::::::..:::::
                        TERMINAL CHAT - Westhetic Edition
*/

import * as blessed from "blessed";
import * as contrib from "blessed-contrib";
import * as net from "net";
// import * as WebSocket from "ws";

class WestheticChat {
  private screen: blessed.Widgets.Screen;
  private messageList!: blessed.Widgets.ListElement;
  private userList!: blessed.Widgets.ListElement;
  private inputBox!: blessed.Widgets.TextboxElement;
  private lcd: any;

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "Westhetic Chat",
      //@ts-expect-error
      cursor: { artificial: true, shape: "line", blink: true },
    });

    this.initializeUI();
    this.setupNetwork();
  }

  private initializeUI(): void {
    // ASCII Art Header
    const header = blessed.box({
      top: 0,
      left: "center",
      width: "100%",
      height: 5,
      content: `
{bold}{#daa520-fg}╔══════════════════════════════════════════════════════════╗{/#daa520-fg}{/bold}
{bold}{#daa520-fg}║     Garlic  C H A T   R O O M                            ║{/#daa520-fg}{/bold}
{bold}{#daa520-fg}╚══════════════════════════════════════════════════════════╝{/#daa520-fg}{/bold}
      `.trim(),
      tags: true,
      style: { fg: "#d4af37", bg: "#2a1f1d" },
    });


    // Main Chat Area
    this.messageList = blessed.list({
      top: 6,
      left: "30%+2",
      width: "70%-3",
      height: "70%-6",
      tags: true,
      label: '{bold}messages{/bold}',
      style: {
        selected: { bg: "#d4af37", fg: "black" },
        item: { fg: "#e8d8b5" },
      },
      //@ts-expect-error
      border: { type: "line", fg: "#8b4513" },
      scrollable: true,
      mouse: true,
      keys: true,
      vi: true,
      items: ['message']
    });

    // Online Users Panel
    this.userList = blessed.list({
      top: 6,
      left: 1,
      width: "30%",
      height: "70%-6",
      label: " {bold}ONLINE USERS{/bold} ",
      tags: true,
      style: {
        selected: { bg: "#8b4513" },
        item: { fg: "#a08c76" },
      },
      //@ts-expect-error
      border: { type: "line", fg: "#d4af37" },
      items: ["Server", "HumanGpt", "FireFart", "G_654", "@P2"],
    });

    // Input Area
    this.inputBox = blessed.textbox({
      bottom: 0,
      left: 0,
      width: "100%",
      height: 3,
      inputOnFocus: true,
      label: 'Input',
      style: {
        fg: "#e8d8b5",
        bg: "#3a2a25",
        focus: { fg: "white", bg: "#4a3a35" },
      },
      //@ts-expect-error
      border: { type: "line", fg: "#d4af37" },
    });

    // Log Area
    const logArea = blessed.log({
      top: "75%",
      left: 0,
      width: "100%",
      label: 'logs',
      height: "25%-3",
      style: { fg: "#a08c76", bg: "#2a1f1d" },
      //@ts-expect-error
      border: { type: "line", fg: "#8b4513" },
      scrollbar: { ch: "░", style: { fg: "#d4af37" } },
    });

    // Assemble UI
    this.screen.append(header);
    this.screen.append(this.messageList);
    this.screen.append(this.userList);
    this.screen.append(this.inputBox);
    this.screen.append(logArea);

    this.setupEvents();
  }

  private setupEvents(): void {
    // Send message on Enter
    this.inputBox.on("submit", (value: string) => {
      this.sendMessage(value);
      this.inputBox.clearValue();
      this.inputBox.focus();
      this.screen.render();
    });

    // Navigation
    this.screen.key(["up", "down"], (ch, key) => {
      if (key.name === "up") this.messageList.up(1);
      if (key.name === "down") this.messageList.down(1);
      this.screen.render();
    });

    // Commands
    this.screen.key(["/"], () => {
      this.inputBox.setValue("/");
      this.screen.render();
    });
  }

  private setupNetwork(): void {
    // Could use WebSocket, TCP sockets, or IRC protocol
    

    // Example with WebSocket
    const ws = new WebSocket("ws://localhost:8080");

    // ws.on("open", () => {
    //   this.lcd.setDisplay("Connected!");
    //   this.addSystemMessage("Connected to Westhetic Chat");
    // });

    // ws.on("message", (data: string) => {
    //   const message = JSON.parse(data);
    //   this.handleIncomingMessage(message);
    // });

    // ws.on("close", () => {
    //   this.lcd.setDisplay("Disconnected");
    //   this.addSystemMessage("Disconnected from server");
    // });
  }

  private sendMessage(text: string): void {
    if (text.startsWith("/")) {
      this.handleCommand(text);
    } else {
      // Add to UI immediately for quick feedback
      this.addMessage("You", text, "cyan");

      // Send to server
      // ws.send(JSON.stringify({ type: 'message', text }));
    }
  }

  private handleCommand(cmd: string): void {
    const [command, ...args] = cmd.slice(1).split(" ");

    switch (command!.toLowerCase()) {
      case "nick":
        this.addSystemMessage(`Changing nickname to: ${args[0]}`);
        break;
      case "join":
        this.addSystemMessage(`Joining channel: ${args[0]}`);
        break;
      case "quit":
        this.addSystemMessage("Goodbye!");
        setTimeout(() => process.exit(0), 1000);
        break;
      case "clear":
        this.messageList.clearItems();
        break;
      default:
        this.addSystemMessage(`Unknown command: ${command}`);
    }
  }

  private addMessage(
    user: string,
    text: string,
    color: string = "#e8d8b5"
  ): void {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `{${color}-fg}{bold}${user}{/bold}{/${color}-fg} [${timestamp}]: ${text}`;

    this.messageList.addItem(formatted);
    this.messageList.setScrollPerc(100); // Auto-scroll to bottom
    this.screen.render();
  }

  private addSystemMessage(text: string): void {
    this.addMessage("System", text, "#d4af37");
  }

  private updateUserList(users: string[]): void {
    this.userList.clearItems();
    this.userList.addItem("{cyan}Server{/cyan}");
    users.forEach((user) => this.userList.addItem(`• ${user}`));
    this.screen.render();
  }

  private handleIncomingMessage(msg: any): void {
    switch (msg.type) {
      case "message":
        this.addMessage(msg.user, msg.text, msg.color || "#e8d8b5");
        break;
      case "userlist":
        this.updateUserList(msg.users);
        break;
      case "system":
        this.addSystemMessage(msg.text);
        break;
      case "whisper":
        this.addMessage(`${msg.user} (whisper)`, msg.text, "magenta");
        break;
    }
  }

  public start(): void {
    this.inputBox.focus();
    this.screen.render();
 



       this.screen.key(
      ["escape", "q", "C-c"],
      function (ch: unknown, key: unknown) {
        return process.exit(0);
      }
    );

    this.addSystemMessage(
      "Welcome to Westhetic Chat! Type /help for commands."
    );
    this.addSystemMessage("Connected users: 12");
  }
}

// Start the chat
const chat = new WestheticChat();
chat.start();
