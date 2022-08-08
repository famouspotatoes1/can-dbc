import tokens from './tokens';
const fs = require('fs');
const readline = require('readline');

interface Signal {
  name: string;
  multiplex: string;
  startBit: number;
  length: number;
  endianness: string;
  signed: boolean;
  factor: number;
  offset: number;
  min: number;
  max: number;
  unit: string;
  receivingNodes: string[];
  description: string | null;
}

interface Message {
  name: string;
  id: number;
  dlc: number;
  sendingNode: string;
  signals: Map<string, Signal>;
  description: string | null;
}

interface DbcData {
  version: string | null;
  messages: Map<string, Message>;
  description: string | null;
  namespace: string[];
  busConfiguration: number | null;
  canNodes: string[];
}

class Dbc {
  dbcFile: string;
  tokens: any;
  data: DbcData;

  constructor(file: string) {
    this.dbcFile = file;
    this.tokens = tokens;

    this.data = {
      version: null,
      messages: new Map(),
      description: null,
      namespace: new Array(),
      busConfiguration: null,
      canNodes: new Array(),
    };
  }

  async load() {
    const fileStream = fs.createReadStream(this.dbcFile);

    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineInfo = null;
    let data: DbcData = {
      version: null,
      messages: new Map(),
      description: null,
      namespace: new Array(),
      busConfiguration: null,
      canNodes: new Array(),
    };
    for await (const line of rl) {
      lineInfo = this.basicTokenization(line, this.tokens);
      data = this.addToDataTable(lineInfo, this.tokens, data);
    }

    // Add table data to class instance for future referencing
    this.data = data;
    return data;
  }

  basicTokenization(line: string, tokens: any) {
    const baseTokens = Object.keys(tokens);

    let foundToken = null;
    let messageTokens = null;
    baseTokens.forEach((token) => {
      if (line.startsWith(token)) {
        foundToken = token;
        messageTokens = [line.match(this.tokens[token].dataFormat)];
        return;
        // Catch indented tokens
      } else if (line.trimStart().startsWith(token) && token === 'SG_') {
        foundToken = token;
        messageTokens = [line.match(this.tokens[token].dataFormat)];
        return;
      }
    });

    return {
      line: line,
      baseToken: foundToken,
      messageTokens: messageTokens,
    };
  }

  addToDataTable(lineInfo: any, tokens: any, data: DbcData) {
    if (lineInfo.baseToken !== null) {
      const baseTokens = Object.keys(tokens);
      let groups;
      try {
        groups = lineInfo.messageTokens[0].groups;
      } catch (error) {
        return data;
      }
      switch (lineInfo.baseToken) {
        case 'VERSION':
          // TODO: Enforce array length should be one for this token set
          data.version = groups.version;
          break;
        case 'BO_':
          const message: Message = {
            name: groups.messageName,
            id: parseInt(groups.id, 10),
            dlc: parseInt(groups.dlc, 10),
            sendingNode: groups.sendingNode,
            signals: new Map(),
            description: null,
          };
          data.messages.set(groups.messageName, message);
          break;
        case 'SG_':
          /* Signals come directly after a message tag, so we can just append
          the current signal instance to the last message found in the array */
          const messageList = Array.from(data.messages.keys());
          const lastKey = messageList[messageList.length - 1];
          if (data.messages.has(lastKey)) {
            const msg = data.messages.get(lastKey);
            const signal: Signal = {
              name: groups.name,
              multiplex: groups.plex,
              startBit: parseInt(groups.startBit, 10),
              length: parseInt(groups.length, 10),
              endianness: groups.endian,
              signed: groups.signed,
              factor: parseInt(groups.factor, 10),
              offset: parseInt(groups.offset, 10),
              min: parseInt(groups.min, 10),
              max: parseInt(groups.max, 10),
              unit: groups.unit,
              receivingNodes: groups.recevingNodes,
              description: null,
            };
            if (msg) {
              msg.signals.set(groups.name, signal);
            }
          }
          break;
        case 'BU_':
          data.canNodes = groups.nodes.trim().split(' ');
        case 'BS_':
          data.busConfiguration = parseInt(groups.speed, 10);
        default:
          break;
      }
    }
    return data;
  }

  addToken() {
    // TODO
  }

  decode(id: number, extended: boolean, dlc: number, payload: number[]) {
    // TODO
  }

  encode(message: Message) {
    // TODO
  }
}

export default Dbc;