import Dbc from '../dbc/dbc';
import { MessageDoesNotExist } from '../dbc/errors';

test('Create Simple Message Object', () => {
  const dbc = new Dbc();
  const msg = dbc.createMessage('TestMessage', 100, 8);

  expect(msg).toEqual({
    name: 'TestMessage',
    id: 100,
    dlc: 8,
    sendingNode: null,
    signals: new Map(),
    description: null,
    attributes: new Map(),
    signalGroups: new Map(),
  });
});

test('Create Complex Message Object', () => {
  const dbc = new Dbc();
  const msg = dbc.createMessage('TestMessage', 100, 8, 'Node1', 'Test Description');

  expect(msg).toEqual({
    name: 'TestMessage',
    id: 100,
    dlc: 8,
    sendingNode: 'Node1',
    signals: new Map(),
    description: 'Test Description',
    attributes: new Map(),
    signalGroups: new Map(),
  });
});

test('Create Simple Signal Object', () => {
  const dbc = new Dbc();
  const signal = dbc.createSignal('TestSignal', 0, 32);

  expect(signal).toEqual({
    name: 'TestSignal',
    startBit: 0,
    length: 32,
    signed: false,
    endianness: 'Intel',
    min: 0,
    max: 0,
    factor: 1,
    offset: 0,
    unit: '',
    description: null,
    multiplex: null,
    receivingNodes: new Array(),
    valueTable: null,
    attributes: new Map(),
  });
});

test('Create Complex Signal Object', () => {
  const dbc = new Dbc();
  const signal = dbc.createSignal(
    'TestSignal',
    0,
    32,
    true,
    'Motorola',
    0,
    1000,
    2,
    0,
    'mV',
    'Test Signal',
    null,
    ['Node1'],
    null,
  );

  expect(signal).toEqual({
    name: 'TestSignal',
    startBit: 0,
    length: 32,
    signed: true,
    endianness: 'Motorola',
    min: 0,
    max: 1000,
    factor: 2,
    offset: 0,
    unit: 'mV',
    description: 'Test Signal',
    multiplex: null,
    receivingNodes: ['Node1'],
    valueTable: null,
    attributes: new Map(),
  });
});

test('Add Simple Message to Data', () => {
  const dbc = new Dbc();
  const msg = dbc.createMessage('TestMessage', 100, 8);

  dbc.addMessage(msg);
  expect(dbc.getMessageByName('TestMessage')).toEqual(msg);
});

test('Add Simple Signal to Data', () => {
  const dbc = new Dbc();
  const msg = dbc.createMessage('TestMessage', 100, 8);
  const signal = dbc.createSignal('TestSignal', 0, 32);

  dbc.addMessage(msg);
  dbc.addSignal('TestMessage', signal);
  expect(dbc.getSignalByName('TestSignal', 'TestMessage')).toEqual(signal);
});

test('Add and Remove Messages', () => {
  const dbc = new Dbc();
  const msg1 = dbc.createMessage('TestMessage', 100, 8);
  const msg2 = dbc.createMessage('TestMessage2', 100, 8);
  const msg3 = dbc.createMessage('TestMessage3', 100, 8);

  dbc.addMessage([msg1, msg2, msg3]);
  expect(dbc.data.messages.size).toBe(3);

  dbc.removeMessage('TestMessage2');
  expect(dbc.data.messages.size).toBe(2);
});

test('Add and Remove Signals', () => {
  const dbc = new Dbc();
  const msg = dbc.createMessage('TestMessage', 100, 8);
  dbc.addMessage(msg);

  const sig1 = dbc.createSignal('TestSignal1', 0, 8);
  const sig2 = dbc.createSignal('TestSignal2', 8, 32);
  const sig3 = dbc.createSignal('TestSignal3', 40, 2);

  dbc.addSignal('TestMessage', [sig1, sig2, sig3]);
  const testMsg = dbc.getMessageByName('TestMessage');
  expect(testMsg?.signals.size).toBe(3);

  dbc.removeSignal('TestSignal3', 'TestMessage');
  expect(testMsg?.signals.size).toBe(2);
});
