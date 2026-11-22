# 09 · Identidad visual

## Concepto
**Dos mitades de un corazón que se encuentran.** Cada mitad es una persona, y el espacio donde se cruzan, en dorado, es el *nosotros*: lo que descubren al preguntarse y responderse.

Archivo fuente del logo: [`assets/logo.svg`](../assets/logo.svg).

## Paleta
| Nombre | Hex | Uso |
|---|---|---|
| Coral | `#FF7A59` | Inicio del degradado y calidez |
| Rosa vibrante | `#FF3D6E` | Color principal: acciones, splash e ícono |
| Violeta eléctrico | `#6D4BFF` | Final del degradado, botones secundarios y sombras |
| Sol | `#FFC24B` | El "nosotros": acentos y momentos compartidos |
| Tinta ciruela | `#1E1330` | Textos (en lugar de negro) |
| Crema | `#FFF8F2` | Fondo de la app |

**Degradado de la marca:** coral → rosa → violeta, en diagonal (de arriba a la izquierda hacia abajo a la derecha).

### Modo oscuro ("noche ciruela")
| Nombre | Hex |
|---|---|
| Fondo | `#140C22` |
| Tarjetas | `#221638` |
| Texto | `#F6F0FF` |
| Bordes | `#33254D` |

Los acentos (rosa, violeta y sol) y el degradado de la marca se mantienen.

## Tipografía
- **Bricolage Grotesque**: títulos, números y botones (`@expo-google-fonts/bricolage-grotesque`).
- **Fuente del sistema**: textos largos y respuestas.
- El nombre se escribe en **minúsculas**: `nosotros`.

## Archivos de ícono
| Archivo | Uso |
|---|---|
| `icon.png` | Ícono general (1024×1024) |
| `android-icon-foreground.png` + `android-icon-background.png` | Ícono adaptable de Android |
| `android-icon-monochrome.png` | Ícono temático de Android 13+ |
| `splash-icon.png` | Pantalla de carga (fondo `#FF3D6E`) |
| `notification-icon.png` | Ícono de las notificaciones (silueta blanca) |

Los colores viven en `src/theme.js` (`colors`, `gradients`, `fonts`). Para cambiar la identidad, se edita ese archivo.
