/**
 * @license
 * Copyright 2019 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const defaultManifest = `
// UIBroker/demo particles below here
import 'https://$particles/Pipes/Pipes.arcs'
import 'https://$particles/Notification/Notification.arcs'
import 'https://$particles/Tutorial/Kotlin/1_HelloWorld/HelloWorld.arcs'
`;

let bus;
let send;

export const createTestDevice = (paths, storage) => {
  return {
    init: _bus => {
      bus = _bus;
      send = envelope => bus.receive(envelope);
    },
    receive: json => {
      const body = JSON.parse(json);
      switch (body.message) {
        case 'ready':
          send({message: 'configure', config: {
            rootPath: paths.root,
            urlMap: paths.map,
            storage,
            manifest: defaultManifest
          }});
          break;
        case 'context':
          smokeTest(bus);
          break;
        case 'pec':
          break;
        default:
          echo(json);
          break;
      }
    }
  };
};

const echo = json => {
  if (!echo.node) {
    echo.node = document.body.appendChild(document.createElement('div'));
    echo.index = 0;
  }
  echo.node.innerText = echo.index++;
  // const data = JSON.parse(json);
  // const formatted = JSON.stringify(data, null, '  ');
  // const simple = JSON.stringify(data);
  // document.body.appendChild(Object.assign(document.createElement('pre'), {
  //   style: 'padding: 8px; border: 1px solid silver; margin: 8px; overflow-x: hidden;',
  //   textContent: formatted,
  //   title: simple.replace(/"/g, '\'')
  // }));
};

const smokeTest = async (bus) => {
  const send = envelope => bus.receive(envelope);
  //
  const enqueue = (tests, delay) => {
    if (tests.length) {
      console.warn(`busish: starting new task...(${tests.length} remaining)`);
      (tests.shift())();
      // wait a bit before starting the test,
      // to simulate (more) serial task requests
      // and make it possible to read the console.
      // (should work in parallel also)
      setTimeout(() => enqueue(tests, delay), delay);
    }
  };
  //
  const enableIngestion = () => {
    // enable 'classic' ingestion
    send({message: 'enableIngestion'});
  };
  //
  const ingestionTest = () => {
    // ingest some data
    send({message: 'ingest', entity: {type: 'person', jsonData: `{"name": "John Hancock"}`}});
  };
  //
  const autofillTest = () => {
    send({message: 'spawn', recipe: 'PersonAutofill'});
  };
  //
  const notificationTest = () => {
    // spawn an arc
    send({message: 'runArc', arcId: 'pipe-notification-test', modality: 'dom', recipe: 'Notification'});
  };
  //
  const parseTest = () => {
    // parse manifest content
    send({message: 'parse', content: `import 'https://$particles/PipeApps/PipeApps.arcs'`});
    // parse manifest file
    send({message: 'parse', path: `https://$particles/PipeApps/PipeApps.arcs`});
  };
  //
  const wasmTest = () => {
    // spawn an arc using WASM particle
    send({message: 'spawn', modality: 'dom', recipe: 'HelloWorldRecipe'});
  };
  //
  const runArcSerialTest = () => {
    // async `runArc` commands are performed serially
    send({message: 'runArc', arcId: 'pipe-notification-test1', modality: 'dom', recipe: 'Notification'});
    send({message: 'runArc', arcId: 'pipe-notification-test2', modality: 'dom', recipe: 'Notification'});
    send({message: 'runArc', arcId: 'pipe-notification-test3', modality: 'dom', recipe: 'Notification'});
  };
  //
  const stressTest = () => {
    console.profile();
    // async `runArc` commands are performed serially
    let count = 0;
    const spawn = () => {
      if (count > 0) {
        echo(count);
        send({message: 'stopArc', arcId: `pipe-stress-test-${count-1}`});
      }
      send({message: 'runArc', arcId: `pipe-stress-test-${count}`, Xrecipe: 'Notification'});
      if (count++ < 500) {
        setTimeout(spawn, 1);
        //document.body.parentElement.scrollTop = 9e5;
      } else {
        console.profileEnd();
      }
    };
    spawn();
  };
  //
  // perform tests
  enqueue([
    // enableIngestion,
    // ingestionTest,
    // autofillTest,
    // notificationTest,
    // wasmTest,
    // parseTest,
    // runArcSerialTest,
    stressTest
  ], 500);
};
