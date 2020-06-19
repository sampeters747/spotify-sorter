import config_app
import models
import numpy as np

Config = config_app.Config

def user_lib_as_arrays(user, omit=[]):
    """ Returns a tuple (track_objects, track_features)
    track_objects is a 1-d numpy array of all the track objects stored from the user's library in our db
    track_features is a 2-d numpy array, with the ith row containing feature data for the ith item in track_objects
    
    omit is a list of track_ids for tracks who should not be included in track_objects and track_features
    """
    track_objects = []
    temp_track_features = []
    for track in user.tracks:
        if track.track_id in omit:
            continue
        relevant_features = []
        for feature in Config.FEATURE_LIST:
            relevant_features.append(getattr(track, feature))
        track_objects.append(track)
        temp_track_features.append(relevant_features)
    track_features = np.array(temp_track_features)
    track_objects = np.array(track_objects)
    return (track_objects, track_features)

def single_track_feature_data(track_id):
    """ Returns a 1-d numpy array containing the feature data for a track with a given track_id """
    result = None
    track = models.Track.query.filter_by(track_id=track_id).first()
    if track:
        features = []
        for feature in Config.FEATURE_LIST:
            features.append(getattr(track, feature))
        result = np.array(features)
    return result

def normalize_array(x):
    """ Divides every element by the max element in its column 
    Returns a new array where each element is between 0 and 1 inclusive
    """
    return x/x.max(axis=0)


def closest_n_songs(user, seed_track_id, n, debug=False):
    """ Returns an array array including the seed_track and the n songs in the user's library
    that are closest to it based on each song's feature data """
    seed_track = models.Track.query.filter_by(track_id=seed_track_id).first()
    if not seed_track:
        raise ValueError("Seed track doesn't exist in DB")
    
    seed_track_features = single_track_feature_data(seed_track_id)
    track_objects, track_features = user_lib_as_arrays(user, omit=[seed_track.track_id])
    # Combining the seed_track_features and the other track's features into one array so we can normalize the different values
    combined = np.concatenate(([seed_track_features], track_features))
    normalized = normalize_array(combined)
    seed_track_features = normalized[0]
    track_features = normalized[1:]

    distances_from_seed_track = np.linalg.norm(track_features - seed_track_features, axis=1)
    indices = np.argsort(distances_from_seed_track)
    print(indices[:50], len(track_objects))
    sorted_tracks = track_objects[indices]
    result = np.concatenate(([seed_track], sorted_tracks[:n]))
    return result

def print_playlist(tracks, playlist_title=False, included_features=[]):
    """ Takes in an array of track_objects and prints them to the console """
    if playlist_title:
        print(playlist_title + ":")
    else:
        print("Playlist:")
    for track in tracks:
        s = f"{track.title} by {track.artist}"
        if included_features:
            for feature in included_features:
                feature_val = getattr(track, feature)
                s += f", {feature}:{feature_val}"
        print(s)
    print()


def stringify_playlist(tracks, playlist_title=False, included_features=[]):  
    """ Takes in an array of track_objects and prints them to the console """
    result = ""
    for track in tracks:
        s = f"{track.title} by {track.artist}"
        if included_features:
            for feature in included_features:
                feature_val = getattr(track, feature)
                s += f", {feature}:{feature_val}"
        result += s + "\n"
    return result
