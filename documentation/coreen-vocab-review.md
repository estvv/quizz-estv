# Review — `voc.md`

Relecture de `voc.md`. Trois niveaux de correction :

- 🔴 **Hangul faux** (mauvaise lettre / mot inexistant) — bloquant, à corriger avant tout usage.
- 🟠 **Romanisation fausse** (le son ne correspond pas au hangul).
- 🟡 **Sens imprécis** ou entrée mal rangée / en double.

---

## 1. Recommandation de fond : passer en Romanisation Révisée (RR)

Ton système de sons est **incohérent d'une ligne à l'autre** — c'est le principal problème :

| jamo | tu écris… | selon la ligne |
|---|---|---|
| ㅈ | `tch`, `ch`, `j` | 저=`tcho`, 작다=`chak`, 저는=`jeo` |
| ㄱ (initiale) | `k` ou `g` | 가다=`ka`, 카메라=`ga` (alors que 카 = ㅋ aspiré !) |
| ㄷ | `d` ou `t` | 받다=`pat`, 뜨거운=`deu` |
| ㅋ ㅌ ㅍ (aspirées) | pas distinguées de ㄱ ㄷ ㅂ | 카메라=`ga-mae-ra` ❌ |
| ㅓ | `eo` ou `o` | 뜨거운=`deu-go-un` ❌ (devrait être `-geo-`) |

Pour une appli qui apprend l'alphabet à des débutants, il vaut mieux **une seule
convention, officielle, celle qu'ils reverront partout** : la **Romanisation Révisée**
(RR, standard sud-coréen). Colonne 3 ci-dessous = RR.

Règles RR utiles : ㅂ/ㄷ/ㄱ/ㅈ = `b/d/g/j` · ㅍ/ㅌ/ㅋ/ㅊ = `p/t/k/ch` ·
ㅓ=`eo` ㅗ=`o` ㅜ=`u` ㅡ=`eu` ㅐ/ㅔ=`ae`/`e` ㅚ=`oe` ㅟ=`wi` ㅢ=`ui` ㅝ=`wo`.

---

## 2. Erreurs 🔴 Hangul (à corriger absolument)

| ligne | français | tu as | correct |
|---|---|---|---|
| 22 | penser | `어ㄷ대요` (cassé) | `생각하다` — *saenggakhada* (et 어때요 = « qu'en penses-tu », ≠ penser) |
| 97 | tofu | `도보` (= « à pied ») | `두부` — *dubu* |
| 100 | ragoût | `ㅉ개` (cassé) | `찌개` — *jjigae* |
| 101 | kimbap | `김밮` (batchim faux) | `김밥` — *gimbap* |
| 108 | chat | `고양` (incomplet) | `고양이` — *goyangi* |
| 149 | employé de bureau | `희사원` (희≠회) | `회사원` — *hoesawon* |
| 150 | peintre | `호가` | `화가` — *hwaga* |
| 192 | petite sœur | `엳동생` (엳 faux) | `여동생` — *yeodongsaeng* |
| 193 | ami | `친고(는)` | `친구` — *chingu* (déjà l.121) |
| 139 | livre | hangul OK `책` | romanisation `chaen` 🟠 → `chaek` |

---

## 3. Erreurs 🟠 Romanisation (hangul OK, son faux)

| ligne | mot | tu as | RR |
|---|---|---|---|
| 6 | 제 (mon) | `jae` | `je` |
| 18 | 필요하다 | `pil-yo-…` | `pi-ryo-ha-da` (liaison ㄹ+ㅇ) |
| 38 | 뜨거운 | `deu-go-un` | `tteu-geo-un` |
| 39 | 맛있는 | `mas-itt-neum` | `ma-din-neun` (는 = *neun*, pas *neum*) |
| 74 | 반가워요 | `ban-ga-wu-yo` | `ban-ga-wo-yo` (워 = *wo*) |
| 136 | 핸드폰 | `haen-deu-pun` | `haen-deu-pon` (폰 = *pon*) |
| 140 | 볼펜 | `bol-paen` | `bol-pen` (펜 = *pen*) |
| 143 | 카메라 | `ga-mae-ra` | `ka-me-ra` (ㅋ aspiré ; 메 = *me*) |
| 151 | 의사 | `wi-sa` | `ui-sa` (의 = *ui* ; *wi* = 위) |
| 158 | 중국 | `ju-guk` | `jung-guk` (중 a un batchim ㅇ) |
| 182 | 예요 | `yeo-yo` | `ye-yo` |
| 186 | 열아홉 | `yeorahob` | `yeol-a-hop` |

Style (pas faux, juste à uniformiser en RR) : `tcho`→`jeo`, `chip`→`jip`,
`ka-da`→`ga-da`, `pap`→`bap`, `keo-pi`→`keo-pi` (OK), `shi`→`si`, `hak-kyo`→`hak-gyo`,
`kam-sa-ham-ni-da`→`gamsahamnida`, etc.

---

## 4. Champs vides à compléter

| ligne | français | 한글 | RR |
|---|---|---|---|
| 21 | avoir faim (inf.) | 배고프다 | *baegopeuda* |
| 43 | j'ai faim | 배고파요 | *baegopayo* |
| 44 | épicé | 매운 (매워요) | *maeun* |
| 45 | sucré | 단 (달아요) | *dan* |
| 46 | mignon | 귀여운 | *gwiyeoun* |
| 64 | aujourd'hui | 오늘 | *oneul* (déjà l.129) |
| 82 | bubble tea | 버블티 | *beobeulti* |
| 104 | galbitang | 갈비탕 | *galbitang* |
| 119 | anniversaire | 생일 | *saengil* |
| 132 | nourriture | 음식 | *eumsik* |
| 134 | montre | 시계 | *sigye* |
| 135 | cadeau | 선물 | *seonmul* |
| 141 | souris (animal) | 쥐 | *jwi* |
| 141b | souris (ordi) | 마우스 | *mauseu* |
| 142 | ordinateur | 컴퓨터 | *keompyuteo* |
| 144 | collier | 목걸이 | *mokgeori* |
| 147 | gris | 회색 | *hoesaek* |
| 154 | patron | 사장님 | *sajangnim* |
| 171 | joyeux anniversaire | 생일 축하해요 | *saengil chukahaeyo* |
| 183 | ceci | 이것 (이거) | *igeot* / *igeo* |
| 188 | vingt | 스물 | *seumul* |
| 189 | quinze | 열다섯 | *yeoldaseot* |
| 191 | grande sœur (d'un homme) | 누나 | *nuna* |
| 195 | particule de thème | 은/는 | *eun / neun* |
| 197 | qu'en penses-tu ? | 어때요 | *eottaeyo* |

---

## 5. Sens 🟡 à préciser

| ligne | remarque |
|---|---|
| 2 | 저는 = 저 (je, poli) **+ 는** (particule de thème) — pas un mot mais deux |
| 56 / 181 | 나 « ou » : c'est la **particule** 나/이나 (커피나 차). « ou » en tête de phrase = 또는 / 아니면. Et 나 = aussi « je » (l.1) → à désambiguïser dans le deck |
| 73 | 씨 = suffixe de nom (« -ssi »). Le `(는)` n'a rien à faire là |
| 128 | 하루 = « une journée » (durée). « jour » en général = 날 |
| 131 | 살 = compteur d'âge (« …ans »). « âge » = 나이 |
| 38 | 뜨거운 = chaud **au toucher** (뜨겁다). Chaud (météo) = 더운 / 덥다 |
| 90 | 채소 est plus courant que 야채 pour « légume » |
| 94 | idem : 생선 = poisson (aliment) ✓ ; poisson (animal vivant) = 물고기 |
| 98 | 오리구이 = canard **grillé/rôti**. « Canard laqué » (chinois) = 베이징 덕 |
| 156–158 | 미국/한국/중국 = **noms de pays**, pas adjectifs. « américain » (personne) = 미국 사람, « je suis coréen » = 저는 한국 사람이에요 |
| 107, 117, 120–126 | doublons entre sections (viande, 사람, 집, 학교, 회사, 물, 밥…) — normal si les decks sont thématiques, mais à dédupliquer au moment de découper |

### Coquilles de titres
`LAISONS` → `LIAISONS`.

---

## 6. Proposition de découpage en decks `Vocabulary`

D'après le contenu, ~13 thèmes exploitables :

`Pronoms` · `Verbes` · `Adjectifs` · `Mots utiles / liaisons` · `Politesse` ·
`Boissons` · `Aliments` · `Lieux` · `Temps & quotidien` · `Objets` · `Couleurs` ·
`Métiers` · `Pays & nationalités` · `Nombres (natifs)` · `Famille` ·
`Phrases utiles` · *(`Insultes` — à garder ? séparé et signalé si oui)*

Les blocs **Exemples / Phrases utiles** ne sont pas du vocab-carte : ils iront plutôt
en `type_answer` (reconstituer la phrase) ou dans une leçon Markdown.

---

## Prochaine étape

Dis-moi :
1. **On bascule tout en RR** (recommandé) ou tu tiens à ta notation de sons ?
2. Je te renvoie un `voc.md` corrigé complet (🔴 + 🟠 + champs vides remplis) que tu relis ?
3. `Insultes` : dans l'appli publique ou non ?
