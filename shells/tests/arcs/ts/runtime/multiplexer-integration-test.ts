/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {assert} from '../../../../../build/platform/chai-web.js';
import {Entity} from '../../../../../build/runtime/entity.js';
import {Runtime} from '../../../../../build/runtime/runtime.js';
import {SlotTestObserver} from '../../../../../build/runtime/testing/slot-test-observer.js';
import {Loader} from '../../../../../build/platform/loader.js';
import {storageKeyPrefixForTest} from '../../../../../build/runtime/testing/handle-for-test.js';
import {StrategyTestHelper} from '../../../../../build/planning/testing/strategy-test-helper.js';
import {handleForStoreInfo, CollectionEntityType} from '../../../../../build/runtime/storage/storage.js';
import {StoreInfo} from '../../../../../build/runtime/storage/store-info.js';
import {DirectStorageEndpointManager} from '../../../../../build/runtime/storage/direct-storage-endpoint-manager.js';
import '../../../../lib/arcs-ui/dist/install-ui-classes.js';

describe('Multiplexer', () => {

  it('renders polymorphic multiplexed slots', async () => {
    const runtime = new Runtime();
    const context = await runtime.parseFile('./shells/tests/artifacts/polymorphic-muxing.recipes');
    runtime.context = context;
    //
    const showOneParticle = context.particles.find(p => p.name === 'ShowOne');
    const showOneSpec = JSON.stringify(showOneParticle.toLiteral());
    const recipeOne =
`${showOneParticle.toString()}
  recipe
    h1: use '{{item_id}}'
    s1: slot '{{slot_id}}'
    ShowOne
      post: reads h1
      item: consumes s1`;

    const showTwoParticle = context.particles.find(p => p.name === 'ShowTwo');
    const showTwoSpec = JSON.stringify(showTwoParticle.toLiteral());
    const recipeTwo =
`${showTwoParticle.toString()}
  recipe
    v1: use '{{item_id}}'
    s1: slot '{{slot_id}}'
    ShowTwo
      post: reads v1
      item: consumes s1`;

    const thePostsStore = context.stores.find(StoreInfo.isCollectionEntityStore);
    const postsHandle = await handleForStoreInfo(thePostsStore, {...context, storageService: new DirectStorageEndpointManager()});
    await postsHandle.add(Entity.identify(
        new postsHandle.entityClass({
          message: 'x',
          renderRecipe: recipeOne,
          renderParticleSpec: showOneSpec
        }),
        '1', null));
    await postsHandle.add(Entity.identify(
        new postsHandle.entityClass({
          message: 'y',
          renderRecipe: recipeTwo,
          renderParticleSpec: showTwoSpec
        }),
        '2', null));
    await postsHandle.add(Entity.identify(
        new postsHandle.entityClass({
          message: 'z',
          renderRecipe: recipeOne,
          renderParticleSpec: showOneSpec
        }),
        '3', null));
    // version could be set here, but doesn't matter for tests.
    const arc = runtime.newArc('demo', storageKeyPrefixForTest());

    const observer = new SlotTestObserver();
    arc.peh.slotComposer.observeSlots(observer);

    const suggestions = await StrategyTestHelper.planForArc(runtime, arc);
    assert.lengthOf(suggestions, 1);

    // Render 3 posts
    observer
      .newExpectations()
      .expectRenderSlot('List', 'root')
      .expectRenderSlot('ShowOne', 'item', {times: 2})
      .expectRenderSlot('ShowTwo', 'item')
      ;

    await suggestions[0].instantiate(arc);
    await arc.idle;

    // Add and render one more post

    // new storage doesn't swallow duplicate writes to Singletons, so the multiplexer's behavior of always
    // updating all generated handles when the collection changes is reflected in the rendering pattern.
    observer
      .newExpectations()
      .expectRenderSlot('List', 'root')
      .expectRenderSlot('ShowOne', 'item', {contentTypes: ['templateName', 'model']})
      .expectRenderSlot('ShowOne', 'item', {times: 2})
      .expectRenderSlot('ShowTwo', 'item')
      ;

    const postsStore = arc.findStoreById(arc.activeRecipe.handles[0].id) as StoreInfo<CollectionEntityType>;
    const postsHandle2 = await handleForStoreInfo(postsStore, arc);
    const entityClass = new postsHandle.entityClass({
      message: 'w',
      renderRecipe: recipeOne,
      renderParticleSpec: showOneSpec
    });
    const entity = Entity.identify(entityClass, '4', null);
    await postsHandle2.add(entity);
    await arc.idle;

    Runtime.resetDrivers();
  });

  // TODO(sjmiles): probably should be in particles/tests/* because of Multiplexer.js
  // TODO(sjmiles): skipped because (in summary) plumbing data from the hostedParticle to the outer
  // arc is not this simple ... research is afoot
  it.skip('multiplexer can host non-slot-using particle', async () => {
    const canonMultiplexer = `./particles/List/source/Multiplexer.js`;
    const manifest = `
      schema Foo
        name: Text
      interface HostedFooParticle
        foo: reads Foo {name}
        //outFoos: writes [Foo {name}]
      particle FooMultiplexer in '${canonMultiplexer}'
        list: reads [Foo {name}]
        outFoos: writes [Foo {name}]
        hostedParticle: hosts HostedFooParticle
      particle FooNoop in './foo.js'
        foo: reads Foo {name}
        outFoos: writes [Foo {name}]
      store FooList of [Foo] #foos in './foo.json'
      recipe MultiFoo
        foos: map #foos
        outFoos: create
        FooMultiplexer
          list: foos
          outFoos: outFoos
          hostedParticle: FooNoop
    `;
    //
    const fooData = [{name: 'Alpha'}, {name: 'Beta'}, {name: 'Gamma'}];
    const statics = {
      './foo.json': JSON.stringify(fooData),
      './foo.js': `
        defineParticle(({UiParticle}) => {
          return class extends UiParticle {
            update({foo}) {
              console.log(\`adding [\${foo.name}] Foo to outFoos\`);
              this.add('outFoos', {name: foo.name});
            }
          };
        });`
    };
    //
    const loader = new Loader(null, statics);
    const runtime = new Runtime({loader});
    const context = await runtime.parseFile('./shells/tests/artifacts/polymorphic-muxing.recipes');
    //
    const arc = runtime.newArc('fooTest', storageKeyPrefixForTest());
    const recipe = context.recipes[0];
    const plan = await Runtime.resolveRecipe(arc, recipe);
    await arc.instantiate(plan);
    await arc.idle;
    //
    // NOTE: a direct translation of this to new storage is unlikely to work as
    // the store map inside arcs is different now.
    //
    // const store = arc.stores[1] as VolatileCollection;
    // const data = await store.toList();
    // console.log(data);
    // assert.equal(JSON.stringify(data), JSON.stringify(fooData), 'unexpected output data');
  });

});
