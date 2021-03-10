from . import config
from flask import Flask, json, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
import dill
import requests
import os
import math


app = Flask(__name__)
CORS(app)
api = Api(app)


class occasion(Resource):
    def post(self):
        requestObject = request.get_json(force=True)

        nlu_data = requestObject["nlu"]
        authorization_code = requestObject["authorization"]

        likelyIntent = nlu_data["intent"]
        if(likelyIntent["name"] == "reporting_occasion"):
            if(likelyIntent["confidence"] >= 0.70):
                entities = nlu_data["entities"][0]
                if(entities["confidence_entity"] >= 0.50):
                    extractName = entities["entity"].find("_") + 1
                    occasionName = entities["entity"][extractName:]
                else:
                    occasionName = "none"
            else:
                occasionName = "none"
        elif(likelyIntent["name"] == "confusion"):
            return jsonify({'endpoint': 'occasion', 'messages': ['-b an occasion would be like a party, workout, or study sesh']})
        else:
            occasionName = "none"

        saveOccasionDataFilename = os.path.join(app.static_folder, 'occasions.pickle')
        occasionDataFile = open(saveOccasionDataFilename, "wb")
        dill.dump(occasionName, occasionDataFile)
        occasionDataFile.close()

        return jsonify({'endpoint': 'newreleases', 'messages': ['-b would you like more newly released music in your playlist?']})


class newreleases(Resource):
    def post(self):
        requestObject = request.get_json(force=True)

        nlu_data = requestObject["nlu"]
        authorization_code = requestObject["authorization"]

        likelyIntent = nlu_data["intent"]
        if(likelyIntent["name"] == "affirm"):
            if(likelyIntent["confidence"] >= 0.70):
                new_releaseData = "yes"
            else:
                new_releaseData = "no"
        elif(likelyIntent["name"] == "confusion"):
            return jsonify({'endpoint': 'newreleases', 'messages': ['-b this question is to gauge the amount of newly released music that will be added to your playlist']})
        else:
            new_releaseData = "no"

        saveNewReleasesDataFilename = os.path.join(app.static_folder, 'newreleases.pickle')
        newreleasesDataFile = open(saveNewReleasesDataFilename, "wb")
        dill.dump(new_releaseData, newreleasesDataFile)
        newreleasesDataFile.close()

        return jsonify({'endpoint': 'profile', 'messages': ['-b finally, should your music listening history influence your playlist?']})


class profile(Resource):
    def post(self):
        requestObject = request.get_json(force=True)

        nlu_data = requestObject["nlu"]
        authorization_code = requestObject["authorization"]

        likelyIntent = nlu_data["intent"]
        if(likelyIntent["name"] == "affirm"):
            if(likelyIntent["confidence"] >= 0.70):
                profileData = "yes"
            else:
                profileData = 'no'
        elif(likelyIntent["name"] == "confusion"):
            return jsonify({'endpoint': 'newreleases', 'messages': ['-b answering yes to this question will allow your music listening history to impact your playlist']})
        else:
            profileData = "no"

        saveProfileDataFilename = os.path.join(app.static_folder, 'profile.pickle')
        profileDataFile = open(saveProfileDataFilename, "wb")
        dill.dump(profileData, profileDataFile)
        profileDataFile.close()

        return jsonify({'endpoint': 'genres', 'messages': ['-b okay, i think i understand you better now', '-b i am now going to ask you questions to understand your taste of music', '-b what genres of music do you like?']})


class genres(Resource):
    def post(self):
        requestObject = request.get_json(force=True)

        nlu_data = requestObject["nlu"]
        authorization_code = requestObject["authorization"]

        likelyIntent = nlu_data["intent"]
        if(likelyIntent["name"] == "reporting_genres"):
            

            genres = []
            entities = nlu_data["entities"]
            for entity in entities:
                name = entity["entity"]
                temp = name.split("_")[1:]
                for genre in temp:
                    genres.append(genre)

            saveGenreDataFilename = os.path.join(app.static_folder, 'genres.pickle')
            genreDataFile = open(saveGenreDataFilename, "wb")
            dill.dump(genres, genreDataFile)
            genreDataFile.close()

            return jsonify({'endpoint': 'artists', 'messages': ["-b using all the information collected, i will now find some artists for you to rank", "-b would you like to manually rank them?"]})

        elif(likelyIntent["name"] == "confusion"):
            return jsonify({'endpoint': 'genres', 'messages': ['-b telling me something like \"i love to listen to jazz and sometimes classical music\" will help me understand your music taste']})
        else:
            genres = ["rock", "pop", "alternative"]
            saveGenreDataFilename = os.path.join(app.static_folder, 'genres.pickle')
            genreDataFile = open(saveGenreDataFilename, "wb")
            dill.dump(genres, genreDataFile)
            genreDataFile.close()

            return jsonify({'endpoint': 'artists', 'messages': ['-b i didnt quite understand you, so i\'ll recommend some popular music genres for you', "-b using all the information collected, i will now find some artists for you to rank", "-b would you like to manually rank them?"]})


class artists(Resource):
    def post(self):
        requestObject = request.get_json(force=True)
        authorization_code = requestObject["authorization"]
        
        artists = []
        artistsFromCategoriesLimit = 6
        artistsFromProfileLimit = 0

        saveGenreDataFilename = os.path.join(app.static_folder, 'genres.pickle')
        genreDataFile = open(saveGenreDataFilename, "rb")
        genres = dill.load(genreDataFile)
        genreDataFile.close()

        categories = genreToCategory(genres)

        saveProfileDataFilename = os.path.join(app.static_folder, 'profile.pickle')
        profileDataFile = open(saveProfileDataFilename, "rb")
        profile = dill.load(profileDataFile)
        profileDataFile.close()
        if(profile=="yes"):
            artistsFromCategoriesLimit = 4
            artistsFromProfileLimit = 2

        access_token = getAccessToken(authorization_code)
        saveATDataFilename = os.path.join(app.static_folder, 'access.pickle')
        atDataFile = open(saveATDataFilename, "wb")
        profile = dill.dump(access_token, atDataFile)
        atDataFile.close()

        artistsFromCategories = getArtistsFromCategories(categories, genres, artistsFromCategoriesLimit, access_token)
        artistsFromProfile = getArtistsFromProfile(genres, artistsFromProfileLimit, access_token)

        mergedList = artistsFromCategories + artistsFromProfile
        finalList = removeReplaceDuplicates(mergedList, access_token)

        saveArtistDataFilename = os.path.join(app.static_folder, 'artist.pickle')
        artistDataFile = open(saveArtistDataFilename, "wb")
        dill.dump(finalList, artistDataFile)
        artistDataFile.close()
            
        #for each artist in the list get their name, photo
        finalArtistData = []
        for id in finalList:
            response = requests.get('https://api.spotify.com/v1/artists/' + id, headers={'Authorization': 'Bearer ' + access_token})
            responseObject = response.json()
            tempArtistData = {"id": id, "name": responseObject["name"], 'image': responseObject["images"][2]["url"]}
            finalArtistData.append(tempArtistData)

        return jsonify({"endpoint": "songs", "messages": ['-b please rank the songs and let me know when you are finished'], "artists": finalArtistData})


class songs(Resource):
    def post(self):
        requestObject = request.get_json(force=True)
        authorization_code = requestObject["authorization"]
        ranking = requestObject["ranking"]

        
        saveOccasionsDataFilename = os.path.join(app.static_folder, 'occasions.pickle')
        occasionsDataFile = open(saveOccasionsDataFilename, "rb")
        occasion = dill.load(occasionsDataFile)
        occasionsDataFile.close()

        saveNRDataFilename = os.path.join(app.static_folder, 'newreleases.pickle')
        newreleasesDataFile = open(saveNRDataFilename, "rb")
        newreleases = dill.load(newreleasesDataFile)
        newreleasesDataFile.close()

        saveGenreDataFilename = os.path.join(app.static_folder, 'genres.pickle')
        genreDataFile = open(saveGenreDataFilename, "rb")
        genres = dill.load(genreDataFile)
        genreDataFile.close()

        minors = getOccasionInfluence(occasion)

        numArtists = 5
        numGenres = 0
        if len(genres) > 1:
            numArtists = 3
            numGenres = 2
        elif len(genres) == 1:
            numArtists = 4
            numGenres = 1

        seedArtists = ""
        for x in ranking[:numArtists]:
            seedArtists += x["id"] + ","

        seedArtists = seedArtists[:-1]
        
        seedGenres = ""
        for y in genres[:numGenres]:
            seedGenres += y + ","

        seedGenres = seedGenres[:-1]

        atFilename = os.path.join(app.static_folder, 'access.pickle')
        atFile = open(atFilename, "rb")
        access_token = dill.load(atFile)
        atFile.close()

        url = "https://api.spotify.com/v1/recommendations?limit=50&market=US&seed_artists="+seedArtists+"&seed_genres="+seedGenres+"&"+minors
        response = requests.get(url, headers={'Authorization': 'Bearer ' + access_token})
        responseObject = response.json()

        finalSongs = []
        for track in responseObject["tracks"]:
            songName = track["name"]
            songId = track["id"]
            artistName = track["artists"][0]["name"]
            image = track["album"]["images"][1]["url"]
            tempSong = {'songName': songName, 'songId': songId, 'artistName': artistName, 'image': image}
            finalSongs.append(tempSong)


        #if newreleases == "yes":
            #sort 100 songs by date 

        return jsonify({'endpoint': "finished", "messages": ["-b check out your new playlist"], 'songs': finalSongs})


def getOccasionInfluence(occasion):
    if occasion == "party":
        return "min_danceability=.5&target_danceability=.75&min_energy=.5&target_energy=.75&min_popularity=50&target_popularity=75&min_valence=.25"
    elif occasion == "workout":
        return "min_danceability=.25&target_danceability=.75&min_energy=.7&target_energy=.85&min_valence=.25"
    elif occasion == "study":
        return "max_danceability=.5&target_danceability=.25&target_instrumentalness=.85&max_speechiness=.65&target_speechiness=.25"
    elif occasion == "chill":
        return "max_danceability=.75&target_danceability=.25&target_energy=.5&max_energy=.75"


def genreToCategory(genres):
    categories = []
    for genre in genres:
        if genre=="hip-hop":
            categories.append('hiphop')
        elif genre=="r-n-b":
            categories.append('rnb')
        elif genre=="dance":
            categories.append('edm_dance')
        elif genre=="electronic":
            categories.append("edm_dance")
        elif genre=="indie":
            categories.append('indie_alt')
        elif genre=="alternative":
            categories.append('indie_alt')
        elif genre=='folk':
            categories.append('roots')
        elif genre=='k-pop':
            categories.append('kpop')
        elif genre=='heavy-metal':
            categories.append('metal')
        else:
            categories.append(genre)

    return categories


def removeReplaceDuplicates(mergedList, access_token):
    newList = mergedList
    while(duplicateCheck(newList)):
        newList = list(set(mergedList))
        add = 6 - len(newList)
        response = requests.get('https://api.spotify.com/v1/artists/' + newList[0] + '/related-artists', headers={'Authorization': 'Bearer ' + access_token})
        responseObject = response.json()
        
        count = 0
        for x in responseObject["artists"]:
            if count < add:
                tempArtist = x["id"]
                if tempArtist not in newList:
                    newList.append(tempArtist)
                    count += 1
        temp = newList.pop(0)
        newList.append(temp)

    return newList


def duplicateCheck(list):
    for e in list:
        if list.count(e) > 1:
            return True
    return False


def getArtistsFromCategories(categories, genres, limit, access_token):
    #get playlist for category
    #get the first artist for a playlist that matches genre
    artists = []
    categoryLimit = math.ceil(limit/len(categories))
    for category in categories:
        response = requests.get('https://api.spotify.com/v1/browse/categories/' + category + '/playlists?country=US&limit=1&offset=5', headers={'Authorization': 'Bearer ' + access_token})
        playlistId = response.json()["playlists"]["items"][0]["id"]

        response = requests.get('https://api.spotify.com/v1/playlists/' + playlistId + '?market=US&fields=tracks.items(track(artists.id,artists.name))', headers={'Authorization': 'Bearer ' + access_token})
        responseObject = response.json()

        countCategory = 0
        for item in responseObject["tracks"]["items"]:
            if countCategory < categoryLimit:
                #print(item["track"]["artists"][0]["name"])
                artists.append(item["track"]["artists"][0]["id"])
                countCategory += 1
    
    return artists


def getArtistsFromProfile(genres, limit, access_token):
    artists = []
    if limit > 0:
        
        response = requests.get("https://api.spotify.com/v1/me/top/artists?limit=50", headers={'Authorization': 'Bearer ' + access_token})
        responseObject = response.json()
        
        count = 0
        for artist in responseObject["items"]:
            if(count<limit):
                artistGenres = artist["genres"]
                genreMatch = False
                for artistGenre in artistGenres:
                    eachWordInArtistGenre = artistGenre.split(" ")
                    for x in eachWordInArtistGenre:
                        for y in genres:
                            eachWordInGenre = y.split("-")
                            for z in eachWordInGenre:
                                if x==z:
                                    genreMatch = True
                if genreMatch:
                    artists.append(artist["id"])
                    #print(artist["name"])
                    count += 1

    return artists


def getAccessToken(authorization_code):
    client_id = config.spotify_client_id
    client_secret = config.spotify_client_secret
    
    response = requests.post('https://accounts.spotify.com/api/token', 
                                data={'grant_type': "authorization_code", 
                                    'code': authorization_code, 
                                    'redirect_uri': 'http://localhost:3000/', 
                                    'client_id': client_id,
                                    'client_secret': client_secret})

    if(response.status_code == 200):
        return response.json()['access_token']
    else:
        return ""


api.add_resource(occasion, '/occasion')
api.add_resource(newreleases, '/newreleases')
api.add_resource(profile, '/profile')
api.add_resource(genres, '/genres')
api.add_resource(artists, '/artists')
api.add_resource(songs, '/songs')


if __name__=="__main__":
    app.run(port=5000)