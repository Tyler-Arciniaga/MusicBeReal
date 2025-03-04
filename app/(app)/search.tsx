import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { debounce } from "lodash";

// Mock data for search results
/*
const mockSongs: Song[] = [
  { id: "1", name: "Shape of You", artist: "Ed Sheeran" },
  { id: "2", name: "Blinding Lights", artist: "The Weeknd" },
  { id: "3", name: "Dance Monkey", artist: "Tones and I" },
  { id: "4", name: "Someone You Loved", artist: "Lewis Capaldi" },
  { id: "5", name: "Watermelon Sugar", artist: "Harry Styles" },
  { id: "6", name: "Levitating", artist: "Dua Lipa" },
  { id: "7", name: "Circles", artist: "Post Malone" },
];
*/

const queriedSongResults: Song[] = [];

interface Song {
  id: string;
  name: string;
  artist: string;
  uri: string;
}

const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET;

// Endpoint
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedSong, setSearchedSong] = useState(""); //this is used for my version
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const searchedSongRef = useRef(searchedSong); //used to create a ref to keep track of most up to date search query
  useEffect(() => {
    searchedSongRef.current = searchedSong; //update whenver state of searchedSong is updated
  }, [searchedSong]);

  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    //API Access Token
    let authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        CLIENT_ID +
        "&client_secret=" +
        CLIENT_SECRET,
    };
    fetch(discovery.tokenEndpoint, authParameters)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });
  }, []);

  async function searchSong() {
    const queriedSong = searchedSongRef.current;
    console.log("====================================");
    console.log(queriedSong);
    console.log(accessTokenRef.current);
    console.log("====================================");

    let trackParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessTokenRef.current,
      },
    };

    let songRequest = await fetch(
      "https://api.spotify.com/v1/search?q=" + queriedSong + "&type=track",
      trackParameters
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setIsLoading(true);
        for (let i: number = 0; i < 7; i++) {
          const newSong: Song = {
            id: String(i),
            name: data.tracks.items[i].name,
            artist: data.tracks.items[i].artists[0].name,
            uri: data.tracks.items[i].uri,
          };
          console.log(newSong);
          queriedSongResults.push(newSong);
        }
        setSearchResults(queriedSongResults);
        setIsLoading(false);
      });
  }

  const handler = useCallback(debounce(searchSong, 2000), []); //for debouncing to limit number of API calls

  /*
  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const filteredSongs = mockSongs.filter(
          (song) =>
            song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredSongs);
        setIsLoading(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  */

  const handleSelectSong = (song: any) => {
    // In a real app, this would navigate back to the create screen with the selected song
    console.log("Selected song:", song);
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSelectSong(item)}
    >
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{item.name}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
      <Ionicons name="checkmark-circle-outline" size={24} color="#1DB954" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Ionicons
          name="search"
          size={24}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="search for a song..."
          value={searchedSong}
          onChangeText={(e) => {
            setSearchedSong(e);
            handler();
          }}
        />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#1DB954" />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No results found"
                : "Start typing to search for songs"}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  artistName: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

export default SearchScreen;
