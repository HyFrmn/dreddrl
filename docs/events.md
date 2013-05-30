Event List
==================================

Inter Entity Events
 - region.enter       - Fired when entering a new region.
 - region.leave       - Fired when leaving a new region.
 - focus.gain         - Fired when entity gains players focus.
 - focus.lose         - Fired when entity loses players focus.
 - contact.tile       - Fired when entity is prevented from moving by contacting a tile.
 - contact.start      - Fired when entity is first contacted by another entity.
 - contact.end        - Fired when entity ends contact with another entity.
 - keydown:KEYCODE    - Fired when KEYCODE button is pressed. See Buttons bellow.
 - xform.move         - Fired anytime the entity is moved.
 - xform.update       - Fired when the velocity on an entity is updated.
 - entity.takeDamage  - Fired when entity take damage from an external event.
 - pickup             - Fired when a new item is picked up.

Intra Entity Events.
 - weapon.fire        - Fire the active weapon. (Created by AI or Controller)
 - entity.kill        - Kill the entity. (Created by HealthComponent usually)
 - state.log          - Log a message
 - state.info         - Display a some information.
 - emote.msg          - Emotes a msg from the emote component. (Created by AI, or scripted events).
 - sprite.tint        - Set the tint of a sprite. //Maybe shouldn't be an event.



 Keycodes
 ------------------------------

 - A    - A Button
 - B    - B Button
 - X    - X Button
 - Y    - Y Button
 - AB   - A or B Button
 - XY   - X or Y Button
 - ANY  - Any Button is pressed.