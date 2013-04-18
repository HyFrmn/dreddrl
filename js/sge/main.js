define(['sge/config',
        'sge/renderer',
        'sge/engine',
        'sge/entity',
        'sge/component',
        'sge/game',
        'sge/gamestate',
        'sge/vendor/pxloader',
        'sge/vendor/virtualjoystick',
        'sge/vendor/hammer',
        'sge/lib/class',
        'sge/lib/random',
        'sge/lib/collision',
        'sge/spritesheet'
        ],
function(
      config,
      Renderer,
      Engine,
      Entity,
      Component,
      Game,
      GameState,
      PxLoader,
      VirtualJoystick,
      Hammer,
      Class,
      random,
      collision,
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
          PxLoader : PxLoader,
          VirtualJoystick : VirtualJoystick,
          Hammer : Hammer
        },
        Class : Class,
        random : random,
        collision : collision,
        SpriteSheet : SpriteSheet
   };
});