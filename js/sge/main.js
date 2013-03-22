define(['sge/config',
        'sge/renderer',
        'sge/engine',
        'sge/entity',
        'sge/component',
        'sge/game',
        'sge/gamestate',
        'sge/vendor/pxloader',
        'sge/lib/class',
        'sge/lib/random',
        'sge/spritesheet'],
function(
      config,
      Renderer,
      Engine,
      Entity,
      Component,
      Game,
      GameState,
      PxLoader,
      Class,
      random,
      SpriteSheet
        ){
   return {
        config: config,
        Renderer: Renderer,
        Engine : Engine,
        Entity : Entity,
        Component : Component,
        Game : Game,
        GameState : GameState,
        vendor : {
          PxLoader : PxLoader
        },
        Class : Class,
        random : random,
        SpriteSheet : SpriteSheet
   };
});