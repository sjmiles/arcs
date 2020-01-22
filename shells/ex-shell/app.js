
/**
 * @license
 * Copyright 2019 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import {Runtime} from '../../build/runtime/runtime.js';

export const App = async (composer) => {
  const context = await Runtime.parse(`import 'https://$particles/Arcs/Login.arcs'`);
  console.log(`context [${context.id}]`);

  const recipe = context.findRecipesByVerb('login')[0];
  console.log(`recipe [${recipe.name}]`);

  const arc = await Runtime.spawnArc({id: 'smoke-arc', context, composer});
  console.log(`arc [${arc.id}]`);

  const plan = await Runtime.resolveRecipe(arc, recipe);
  await arc.instantiate(plan);

  console.log(`store [${arc._stores[0].id}]`);

  console.log(`\narc serialization`);
  console.log(`=============================================================================`);
  console.log(await arc.serialize());
  console.log(`=============================================================================`);

  return arc;
};
