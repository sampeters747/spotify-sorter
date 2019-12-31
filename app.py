import json
from flask import Flask, request, session, redirect, url_for, render_template
from flask_sqlalchemy import SQLAlchemy
import spotipy
from spotipy import oauth2
import time
from math import ceil, sqrt
import random
import numpy as np
from flask_session import Session

app = Flask(__name__)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key= 'reallysecret'
app.config['SQLALCHEMY_ECHO'] = False

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://sam:verysecret@localhost:5432/flask"
db = SQLAlchemy(app)

SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)
Session(app)

# SQLAlchemy Models
class User(db.Model):
    __tablename__ = 'User'
    user_id = db.Column(db.String(50), unique= True, nullable = False, primary_key = True)
    email = db.Column(db.String(120), unique= True)
    access_token = db.Column(db.String(300))
    access_expires = db.Column(db.Integer)
    refresh_token = db.Column(db.String())  
    scope = db.Column(db.String())
    tracks = db.relationship('Track', secondary = 'User_tracks', backref= db.backref('users'))

    def library_as_dict(self, features: list) -> dict:
        lib_dict = {}
        for track in self.tracks:
            relevant_features = []
            for feature in features:
                relevant_features.append(getattr(track, feature))
            lib_dict[track.track_id] = relevant_features
        return lib_dict

    def lib_as_array(self, features: list):
        list_of_track_features = []
        list_of_track_objects = []
        for track in self.tracks:
            relevant_features = []
            for feature in features:
                relevant_features.append(getattr(track, feature))
            list_of_track_features.append(relevant_features)
            list_of_track_objects.append(track)
        track_features = np.array(list_of_track_features)
        track_objects = np.array(self.tracks)
        return track_objects, track_features

    def check_featureless_tracks(self):
        features = ['acousticness', 'danceability', 'energy', 'instrumentalness', 'key', 'valence']
        print('ran check')
        for track in self.tracks:
            for feature in features:
                val = getattr(track, feature)
                if (type(val) != int) and (type(val) != float):
                    print(type(val))
                    print(track.name)
            

class Track(db.Model):
    __tablename__ = 'Track'
    track_id = db.Column(db.String(), primary_key= True)
    name = db.Column(db.String(), nullable= False)
    artist = db.Column(db.String())
    preview_url = db.Column(db.String())
    features_updated = db.Column(db.Integer, default = 0)
    acousticness = db.Column(db.Float)
    danceability = db.Column(db.Float)
    energy = db.Column(db.Float)
    instrumentalness = db.Column(db.Float)
    key = db.Column(db.Integer)
    liveness = db.Column(db.Float)
    loudness = db.Column(db.Float)
    speechiness = db.Column(db.Float)
    valence = db.Column(db.Float)
    tempo = db.Column(db.Float)
    mode = db.Column(db.Integer)

User_tracks = db.Table('User_tracks',
    db.Column('user_id', db.String(), db.ForeignKey('User.user_id'), primary_key=True),
    db.Column('track_id', db.String(), db.ForeignKey('Track.track_id'), primary_key=True)
)

# Initial DB Setup, careful, DROPS TABLES
setup = False
if setup:
    db.drop_all()
    db.create_all()

# Spotify Oauth2 Api Access Stuff
client_id = '8e444e79ae284509aed0c135b2bf555a'
client_secret = 'ee58df103e0043df970fc00d50a81ccb'
redirect_uri = 'http://127.0.0.1:5000/callback'
scope='user-library-read user-read-private playlist-modify-public'
sp_oauth = oauth2.SpotifyOAuth(client_id, client_secret, redirect_uri, scope= scope)


""" Spotify API Functions """
def save_playlist_to_spotify(user, cluster):
    check_auth(user)
    sp = spotipy.client.Spotify(auth = user.access_token)
    animals = [
    "aardvark",
    "albatross",
    "alligator",
    "alpaca",
    "ant",
    "anteater",
    "antelope",
    "ape",
    "armadillo",
    "baboon",
    "badger",
    "barracuda",
    "bat",
    "bear",
    "beaver",
    "bee",
    "bison",
    "boar",
    "buffalo",
    "butterfly",
    "camel",
    "capybara",
    "caribou",
    "cassowary",
    "cat",
    "caterpillar",
    "cattle",
    "chamois",
    "cheetah",
    "chicken",
    "chimpanzee",
    "chinchilla",
    "chough",
    "clam",
    "cobra",
    "cockroach",
    "cod",
    "cormorant",
    "coyote",
    "crab",
    "crane",
    "crocodile",
    "crow",
    "curlew",
    "deer",
    "dinosaur",
    "dog",
    "dogfish",
    "dolphin",
    "donkey",
    "dotterel",
    "dove",
    "dragonfly",
    "duck",
    "dugong",
    "dunlin",
    "eagle",
    "echidna",
    "eel",
    "eland",
    "elephant",
    "elephant-seal",
    "elk",
    "emu",
    "falcon",
    "ferret",
    "finch",
    "fish",
    "flamingo",
    "fly",
    "fox",
    "frog",
    "gaur",
    "gazelle",
    "gerbil",
    "giant-panda",
    "giraffe",
    "gnat",
    "gnu",
    "goat",
    "goose",
    "goldfinch",
    "goldfish",
    "gorilla",
    "goshawk",
    "grasshopper",
    "grouse",
    "guanaco",
    "guinea-fowl",
    "guinea-pig",
    "gull",
    "hamster",
    "hare",
    "hawk",
    "hedgehog",
    "heron",
    "herring",
    "hippopotamus",
    "hornet",
    "horse",
    "human",
    "hummingbird",
    "hyena",
    "ibex",
    "ibis",
    "jackal",
    "jaguar",
    "jay",
    "jellyfish",
    "kangaroo",
    "kingfisher",
    "koala",
    "komodo-dragon",
    "kookabura",
    "kouprey",
    "kudu",
    "lapwing",
    "lark",
    "lemur",
    "leopard",
    "lion",
    "llama",
    "lobster",
    "locust",
    "loris",
    "louse",
    "lyrebird",
    "magpie",
    "mallard",
    "manatee",
    "mandrill",
    "mantis",
    "marten",
    "meerkat",
    "mink",
    "mole",
    "mongoose",
    "monkey",
    "moose",
    "mouse",
    "mosquito",
    "mule",
    "narwhal",
    "newt",
    "nightingale",
    "octopus",
    "okapi",
    "opossum",
    "oryx",
    "ostrich",
    "otter",
    "owl",
    "ox",
    "oyster",
    "panther",
    "parrot",
    "partridge",
    "peafowl",
    "pelican",
    "penguin",
    "pheasant",
    "pig",
    "pigeon",
    "polar-bear",
    "pony",
    "porcupine",
    "porpoise",
    "prairie-dog",
    "quail",
    "quelea",
    "quetzal",
    "rabbit",
    "raccoon",
    "rail",
    "ram",
    "rat",
    "raven",
    "red-deer",
    "red-panda",
    "reindeer",
    "rhinoceros",
    "rook",
    "salamander",
    "salmon",
    "sand-dollar",
    "sandpiper",
    "sardine",
    "scorpion",
    "sea-lion",
    "sea-urchin",
    "seahorse",
    "seal",
    "shark",
    "sheep",
    "shrew",
    "skunk",
    "snail",
    "snake",
    "sparrow",
    "spider",
    "spoonbill",
    "squid",
    "squirrel",
    "starling",
    "stingray",
    "stinkbug",
    "stork",
    "swallow",
    "swan",
    "tapir",
    "tarsier",
    "termite",
    "tiger",
    "toad",
    "trout",
    "turkey",
    "turtle",
    "vicuña",
    "viper",
    "vulture",
    "wallaby",
    "walrus",
    "wasp",
    "water-buffalo",
    "weasel",
    "whale",
    "wolf",
    "wolverine",
    "wombat",
    "woodcock",
    "woodpecker",
    "worm",
    "wren",
    "yak",
    "zebra"
    ]
    playlist_name = random.choice(animals)
    response = sp.user_playlist_create(sp.me()['id'], playlist_name)
    playlist_id = response['id']
    for i in range(0,len(cluster), 100):
        sp.user_playlist_add_tracks(sp.me()['id'], playlist_id, cluster[i:i+100])
    print('Second response')
    print(response)
    

def is_token_expired(exp_time):
    # Checks if Spotify access token is expired
    now = int(time.time())
    return exp_time - now < 60

def check_auth(user):
    # Checks if user has a token, and if it is expired
    "Takes user sql_alchemy obj and updates access token if necessary"
    if user.access_token:
        if is_token_expired(user.access_expires):
            response = sp_oauth.refresh_access_token(user.refresh_token)
            user.access_token = response['access_token']
            user.refresh_token = response['refresh_token']
            db.session.commit()
        
    else:
        False
    return True

def dl_user_lib(user):
    "Gets user obj and returns list of saved_track objects in user library"
    library = []
    sp = spotipy.client.Spotify(auth = user.access_token)
    response = sp.current_user_saved_tracks(limit=50)
    # Dictionary where keys = trackname, values = [artists who made a song with this name]
    unique_tracks = {}
    # First call happens before we know how many tracks in library, hence two loops
    for item in response['items']:
        # Getting the part we care about
        item = item['track']
        # If a song with this name hasn't been seen before
        if item['name'] not in unique_tracks:
            unique_tracks[item['name']] = [item['artists'][0]]
            library.append(item)
        # A track with that name has been seen before
        else:
            # Checking if it's really the same song
            if item['artists'][0] in unique_tracks[item['name']]:
                print("DL_USER_LIB:",item['name'], "duplicate found")
            else:
                library.append(item)
                unique_tracks[item['name']].append(item['artists'][0])
    trackcount = response['total']
    print(f"User has {trackcount} tracks")
    if trackcount > 50:
        for offset in range(50, trackcount, 50):
            response = sp.current_user_saved_tracks(limit=50, offset= offset)
            for item in response['items']:
                # Getting the part we care about
                item = item['track']
                # If a song with this name hasn't been seen before
                if item['name'] not in unique_tracks:
                    unique_tracks[item['name']] = [item['artists'][0]]
                    library.append(item)
                # A track with that name has been seen before
                else:
                    # Checking if it's really the same song
                    if item['artists'][0] in unique_tracks[item['name']]:
                        print("DL_USER_LIB:",item['name'], "duplicate found")
                    else:
                        library.append(item)
                        unique_tracks[item['name']].append(item['artists'][0])
    

    return library

def check_duplicates(saved_tracks_list):
    saved_tracks = [(t['name'], t['id']) for t in saved_tracks_list]
    new_list = []
    print(f"There are {len(saved_tracks_list)} tracks in nonfiltered list")
    for t in saved_tracks:
        if t[0] in new_list:
            print(f"{t[0]} is already in the list")
        else:
            new_list.append(t[0])
    print(len(new_list))

def refresh_user_tracks(user):
    "Gets user and adds user tracks to database, removing old songs of user"
    valid = check_auth(user)
    if not valid:
        return "User has not granted access to their spotify account"
    user.tracks = []
    saved_tracks = dl_user_lib(user)
    print(f'there are {len(saved_tracks)} saved tracks')
    featureless_tracks = []
    for t in saved_tracks:
        track_in_db = db.session.query(Track).get(t['id'])
        if track_in_db:
            #print(f'{t["name"]} was found in the database')
            user.tracks.append(track_in_db)
        else:
            sql_track = Track(track_id= t['id'], name = t['name'], artist = t['artists'][0]['name'], preview_url = t['preview_url'])
            #print(f'{t["name"]} was just made a sql obj')
            featureless_tracks.append(sql_track)
            user.tracks.append(sql_track)
    dl_track_features(user, featureless_tracks)
    return 'It worked'

def dl_track_features(user, tracks):

    # create instance of the Spotify client
    sp = spotipy.client.Spotify(auth=user.access_token)
    
    audio_features = []
    # iterate through the tracks in batches of 100
    batch_count = ceil(len(tracks)/100)
    for batch in range(batch_count):
        # create a list of track IDs in this batch, then get the audio features for all of them
        track_ids = [track.track_id for track in tracks[100*batch:100*(batch+1)]]
        audio_features += sp.audio_features(track_ids)

    # iterate through each track
    for i in range(len(audio_features)):
        tf = audio_features[i]
        if tf:
            features = ['acousticness', 'danceability', 'energy', 'instrumentalness', 'liveness',
                        'loudness', 'speechiness', 'valence', 'key', 'tempo', 'mode']
            for feature in features:
                setattr(tracks[i], feature, tf[feature])
    
    # commit all changes (i.e. to track features)
    db.session.commit()


def centroids_from_array(k, A):
    # Random indexes to grab
    top_idx = A.shape[0]
    idx = np.random.randint(0, top_idx, size=k)
    # We use this for our initial centroids
    random_subarray = A[idx,:]
    return random_subarray

def kplusplus_centroids(k,A):
    choice = random.choice(range(len(A)))
    seed = A[choice]
    centroids = np.array([seed])
    A = np.delete(A, choice, axis=0)
    k = k-1
    while k > 0:
        weights = np.min(np.linalg.norm(A-centroids[:,None], axis=2), axis=0)
        weights = weights **2
        choice = random.choices(range(len(A)), weights= weights)[0]
        centroids = np.append(centroids, [A[choice]], axis=0)
        A = np.delete(A, choice, axis=0)
        k = k-1
    return centroids


def np_cluster(A, track_objs, k, r, features):
    # List of np arrays containing clusters of track obj that will be returned
    clusters = []
    # We use this later to calculate which tracks go to which cluster
    cluster_indices = np.arange(k).reshape((k, 1))
    # Randomly select centroids
    #centroids = centroids_from_array(k, A)
    centroids = kplusplus_centroids(k,A)
    # Repeat algorithm 'r' number of times
    #Keep track of changes to clusters
    prevmeans = [-1]
    means = [1]
    apass = 0
    while (not np.array_equal(prevmeans, centroids)) and apass < 30:

        apass += 1
        prevmeans = centroids.copy()
    #for apass in range(r):
        cluster_assignments = np.argmin(np.linalg.norm(A - centroids[:, None], axis=2), axis=0)
        bools = cluster_indices == cluster_assignments
        for i in range(k):
                means = np.mean(A[bools[i]], axis = 0)
                centroids[i] = means
        
    for i in range(k):
        clusters.append(track_objs[bools[i]])
    numbers=[]
    for i in range(k):
        numbers.append(A[bools[i]])
    return clusters, eval_cluster_accuracy(A, bools, centroids)
    

def standardize(A):
    A = (A - np.mean(A, axis=0)) / np.std(A, axis=0)
    return A

def eval_cluster_accuracy(A, bools, centroids):
    "Measures the total squared distance between each point and the nearest centroid"
    clusters=[]
    for i in range(len(centroids)):
        clusters.append(A[bools[i]])
    for c in clusters:
        if len(c)==0:
            return -1
    
    sum = 0
    for i in range(len(centroids)):
        sum += np.sum(np.absolute((centroids[i]-clusters[i])**2))
    return sum

def repeated_cluster(user, k, r, features):
    for k in range(12,13):
        start = time.time()
        track_objs, A = user.lib_as_array(features)
        if len(track_objs) < k:
            return [[obj] for obj in track_objs]
        A = standardize(A)
        try_counter = 0
        best_score = -1
        final_clusters = []
        while try_counter < 30:
            try_counter += 1
            clusters, score = np_cluster(A, track_objs, k, 55, features)
            #print(f"Iteration: {try_counter} Score: {score} Current best score: {best_score}")
            if best_score==-1:
                current_best=clusters
                best_score= score
            elif score<best_score:
                current_best=clusters
                best_score=score
        for c in current_best:
            if len(c) != 0:
                final_clusters.append(c)
        end = time.time()
        print(k, round(end-start,2),  round(best_score,2))
    return final_clusters



""" View Functions """

@app.route('/saveplaylist',  methods=['POST'])
def saveplaylist():
    if 'id' in session:
        name= session['id']
        user = db.session.query(User).get(session['id'])
        if not user:
            redir = sp_oauth.get_authorize_url()
            css = url_for('static', filename='unverified.css')
            return render_template('unverified.html', css = css, redirect_url = redir)
        print(request.json)
        l = json.loads(request.json)
        print(f'l1={l[1]}')
        print(type(l))
        print(type(l[1]))
        print(session['id'])
        save_playlist_to_spotify(user, l)
        return request.json
    return False
@app.route('/',  methods=['GET','POST'])
def index():
    if 'id' in session:
        name= session['id']
        user = db.session.query(User).get(session['id'])
        if not user:
            redir = sp_oauth.get_authorize_url()
            css = url_for('static', filename='unverified.css')
            return render_template('unverified.html', css = css, redirect_url = redir)
        name = f'{name}: {len(user.tracks)}'
        print(f'printing user:{user}')
        css = url_for('static', filename='index.css')
        user.check_featureless_tracks()
        print(request.form)
        print(request.values)
        if request.form:
            print(request.form)
            if "refresh" in request.form:
                print('refreshing')
                refresh_user_tracks(user)
            else:
                features = []
                for val in request.form.getlist("f"):
                    features.append(val)

                #Screening uneven results
                try_counter= 0
                while True:
                    try_counter +=1
                    shortened_clusters =[]
                    if try_counter==15:
                        print(f"Couldn't find clusters with {features}")
                        for c in clusters:
                            if len(c) != 0:
                                shortened_clusters.append(c)
                        clusters = shortened_clusters
                        break
                    clusters = repeated_cluster(user, 24, 55, features)
                    for cluster in clusters:
                        if len(cluster) == 0:
                            break
                    else:
                        break
                clustersById = []
                for cluster in clusters:
                    id_l = []
                    for track in cluster:
                        id_l.append(track.track_id)
                    json_string = json.dumps(id_l)
                    clustersById.append(json_string)
                    
                return render_template('index.html', css = css, name= name, clusters= clusters, clustersById=clustersById)
        else:
            print('no form')
        return render_template('index.html', css = css, name= name)

    else:
        redir = sp_oauth.get_authorize_url()
        css = url_for('static', filename='unverified.css')
        return render_template('unverified.html', css = css, redirect_url = redir)

@app.route('/login')
def give_auth_url():
    auth_url = sp_oauth.get_authorize_url()
    redir = redirect(auth_url)
    return redir

@app.route('/callback')
def retrive_code():
    code = sp_oauth.parse_response_code(request.url)
    sp_auth_response = sp_oauth.get_access_token(code)
    sp = spotipy.client.Spotify(auth= sp_auth_response['access_token'])
    me = sp.me()
    session['id'] = me['id']
    session['updated'] = None
    user = User(user_id=  me['id'], access_token= sp_auth_response['access_token'], access_expires= sp_auth_response['expires_at'], refresh_token= sp_auth_response['refresh_token'])
    try:
        db.session.add(user)
        db.session.commit()
    except:
        print(f"User: {user.user_id} already in db")
    refresh_user_tracks(user)
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('id', None)
    session.pop('auth', None)
    session.pop('updated', None)
    return 'You have been logged out'

@app.route('/viewauth')
def viewauth():
    return str(db.session.query(User).get(session['id']).access_token)

@app.route('/refreshlib')
def refresh_lib():
    if session['updated'] == None:
        session['updated'] = 'yes'
        if 'id' not in session:
            return 'please login'
        user = db.session.query(User).get(session['id'])
        refresh_user_tracks(user)
        return str(len(user.tracks))
    else:
        return 'refresh already ran'




if __name__ == '__main__':
   app.run(debug= True)
