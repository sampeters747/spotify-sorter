# spotify-sorter
This project is a flask based website I wrote during 2019 to create better playlists for myself on spotify.
It uses a modified kmeans clustering algorithm implemented with numpy to cluster songs based on attributes like acousticness, energy, tempo, and valence. I get these attributes for each song from Spotify's API, and then store them in a postgresql database for repeated use.