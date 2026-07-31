# Player photos — Season 1 (UNITY)

Photos are now uploaded **from the website** and stored in **Netlify Blobs** (see
`netlify/functions/player-photo.mjs`). On the Season 1 page, hover a player card
and click the 📷 button to upload/replace that player's photo — it's centre-cropped
to a square and compressed in the browser before upload. Missing photo → the card
shows the player's initials.

This folder is only needed if you want to **hard-code** a photo for someone instead:
add a `photo: 'assets/players/whatever.jpg'` field to that player in `../../players.js`.

The id map below is handy for matching a person to their `pXX` id.

## Player id → person

| File     | Player                               | Age    | Positions |
|----------|--------------------------------------|--------|-----------|
| p01.jpg  | Gopikrishna Mallampati               | 30-40  | OH / OPP / MB |
| p02.jpg  | Vamsi Krishna Madasu                 | 20-30  | S / OH / OPP |
| p03.jpg  | Gowthami Yalamanchili                | 30-40  | S / L / DS |
| p04.jpg  | Amith                                | 40+    | S / OPP |
| p05.jpg  | Taranjeet Singh                      | 30-40  | S / MB / L |
| p06.jpg  | Naveen                               | 30-40  | OH / OPP |
| p07.jpg  | Sahil Kumar                          | 20-30  | OPP |
| p08.jpg  | Shiva Shankar Reddy Samula           | 40+    | OH / MB |
| p09.jpg  | Sree Harsha                          | 40+    | OH / MB / DS |
| p10.jpg  | Raghuveer Doddi                      | 30-40  | DS |
| p11.jpg  | Vasudeva Ashish Gali                 | 30-40  | S / L / DS |
| p12.jpg  | Jaipal Reddy Thumkunta               | 40+    | DS |
| p13.jpg  | Solairajan R                         | 30-40  | OH |
| p14.jpg  | Appu G                               | 40+    | DS |
| p15.jpg  | Ravi Varma Penmatsa                  | 20-30  | OPP / MB / L |
| p16.jpg  | Vijay Veerapaneni                    | 40+    | S |
| p17.jpg  | Nitin Narang                         | 30-40  | S / MB / L |
| p18.jpg  | Venkata Avinash Varma Kakarlapudi    | 30-40  | S / L / DS |
| p19.jpg  | Ramesh Baggam                        | 40+    | S |
| p20.jpg  | Sunil Bairu                          | 40+    | L / DS |
| p21.jpg  | Ananth Rakesh Palaka                 | 40+    | S / OPP / DS |
| p22.jpg  | Sai Ram Kumar Ganta                  | 30-40  | S |
| p23.jpg  | Raj Gunnam                           | 40+    | S / OH / MB |
| p24.jpg  | Vijaya Kumar Thorati                 | 40+    | S |
| p25.jpg  | Sandeep Kollu                        | 40+    | OH |
| p26.jpg  | Ravi Ankam                           | 40+    | DS |
| p27.jpg  | Sohini Gady                          | 20-30  | MB / DS |
| p28.jpg  | Venkat Adusumalli                    | 30-40  | DS |
| p29.jpg  | Virat Dadi  (junior)                 | 10-20  | L |
| p30.jpg  | Kiran Dadi                           | 40+    | L / DS |
| p31.jpg  | Hrishikesh Enakolu                   | 20-30  | OH |
| p32.jpg  | Kasi                                 | 30-40  | OPP |
| p33.jpg  | Kasi (Son)                           | 30-40  | S |
| p34.jpg  | Swamy Thota                          | 30-40  | OH / OPP / DS |
| p35.jpg  | Avinash Vajji                        | 30-40  | S / L / DS |
| p36.jpg  | Dhruvan Obineedi  (junior)           | 10-20  | OH |
| p37.jpg  | Raghu Obineedi                       | 40+    | S |
| p38.jpg  | Sravan Alluri                        | 30-40  | DS |
