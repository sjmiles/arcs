/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {assert} from '../../../../../build/platform/chai-web.js';
import {Arc} from '../../../../../build/runtime/arc.js';
import {Runtime} from '../../../../../build/runtime/runtime.js';
import {SlotTestObserver} from '../../../../../build/runtime/testing/slot-test-observer.js';
import {storageKeyPrefixForTest} from '../../../../../build/runtime/testing/handle-for-test.js';
import {CollectionEntityHandle, CollectionEntityType, handleForStoreInfo} from '../../../../../build/runtime/storage/storage.js';
import {StoreInfo} from '../../../../../build/runtime/storage/store-info.js';
import '../../../../lib/arcs-ui/dist/install-ui-classes.js';

describe('products test', () => {

  afterEach(() => {
    Runtime.resetDrivers();
  });

  const manifestFilename = './shells/tests/artifacts/ProductsTestNg.arcs';

  const verifyFilteredBook = async (arc: Arc) => {
    const booksHandle = arc.activeRecipe.handleConnections.find(hc => hc.isOutput).handle;
    const store = arc.findStoreById(booksHandle.id) as StoreInfo<CollectionEntityType>;
    const handle: CollectionEntityHandle = await handleForStoreInfo(store, arc);
    const list = await handle.toList();
    assert.lengthOf(list, 1);
    assert.strictEqual('Harry Potter', list[0].name);
  };

  it('filters', async () => {
    const runtime = new Runtime();
    runtime.context = await runtime.parseFile(manifestFilename);
    const arc = runtime.newArc('demo', storageKeyPrefixForTest());
    const recipe = arc.context.recipes.find(r => r.name === 'FilterBooks');
    assert.isTrue(recipe.normalize() && recipe.isResolved());
    await arc.instantiate(recipe);
    await arc.idle;
    await verifyFilteredBook(arc);
  });

  it('filters and displays', async () => {
    const runtime = new Runtime();
    runtime.context = await runtime.parseFile(manifestFilename);
    const arc = runtime.newArc('demo');
    const recipe = arc.context.recipes.find(r => r.name === 'FilterAndDisplayBooks');
    assert.isTrue(recipe.normalize() && recipe.isResolved());

    const observer = new SlotTestObserver();
    arc.peh.slotComposer.observeSlots(observer);
    observer
        .newExpectations()
        .expectRenderSlot('List', 'root')
        .expectRenderSlot('List', 'root')
        .expectRenderSlot('ShowProduct', 'item')
        ;
    await arc.instantiate(recipe);
    await arc.idle;
    await verifyFilteredBook(arc);
  });

});
