/**
 * @license
 * Copyright 2019 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import {App} from './app.js';
import {Runtime} from '../../build/runtime/runtime.js';
import {SlotComposer} from '../../build/runtime/slot-composer.js';
import {SlotObserver} from '../lib/xen-renderer.js';
import {DriverFactory} from '../../build/runtime/storageNG/drivers/driver-factory.js';
import {Exists} from '../../build/runtime/storageNG/drivers/driver.js';
import {RamDiskStorageDriverProvider} from '../../build/runtime/storageNG/drivers/ramdisk.js';
import {SimpleVolatileMemoryProvider} from '../../build/runtime/storageNG/drivers/volatile.js';
import {StorageKeyParser} from '../../build/runtime/storageNG/storage-key-parser.js';

// run
(async () => {
  try {
    //DriverFactory.register(new RamDiskStorageDriverProvider(new SimpleVolatileMemoryProvider()));
    RamDiskStorageDriverProvider.register(new SimpleVolatileMemoryProvider());
    //const driver = await DriverFactory.driverInstance(StorageKeyParser.parse('ramdisk://'), Exists.ShouldCreate);
    //console.warn(driver);
    // configure arcs environment
    Runtime.init('../..');
    // construct renderer
    const composer = new SlotComposer();
    composer.observeSlots(new SlotObserver(document.body));
    // start app
    await App(composer);
  } catch (x) {
    console.error(x);
  }
})();
