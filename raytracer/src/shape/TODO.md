# Shape data

Consists of 4 textures:
* `OBJECT_DATA`
* `TREE_DATA`
* `FLOAT_DATA`
* `INT_DATA`

Each is RGBA texture, so each index contain 4 `float` or 4 `int` (both 32-bit);

## `OBJECT_DATA`

### `OBJECT_DATA[0]`

The 32-bit integer is split into 3:

* The low 16-bit define an object type; (0 - 65536)
* The next 8-bit define object-wide flags; (8 flags in total)
* The final 8-bit define the children count, if container, or 8 additional bits if drawable;
