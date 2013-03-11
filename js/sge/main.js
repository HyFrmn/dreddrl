define(['sge/config',
        'sge/renderer',
        'sge/engine',
        'sge/entity',
        'sge/component',
        'sge/map',
        'sge/dungeongenerator',
        'sge/shadowcaster',
        'sge/game',
        'sge/gamestate',
        'sge/rpgstate',
        'sge/vendor/pxloader',
        'sge/lib/class',
        'sge/lib/random'],
function(
      config,
      Renderer,
      Engine,
      Entity,
      Component,
      Map,
      DungeonGenerator,
      ShadowCaster,
      Game,
      GameState,
      RPGState,
      PxLoader,
      Class,
      random
        ){
   return {
        config: config,
        Renderer: Renderer,
        Engine : Engine,
        Entity : Entity,
        Component : Component,
        Map : Map,
        DungeonGenerator : DungeonGenerator,
        ShadowCaster : ShadowCaster,
        Game : Game,
        GameState : GameState,
        RPGState : RPGState,
        vendor : {
          PxLoader : PxLoader
        },
        Class : Class,
        random : random
   };
});