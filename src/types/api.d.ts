/**
 * YouTube Search API types (yt-search library)
 */
export interface YouTubeVideo {
  title: string;
  url: string;
  duration: {
    timestamp: string; // Format: "HH:MM:SS" or "MM:SS"
  };
  // Additional properties may exist but are not used in the codebase
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  // Additional properties may exist but are not used in the codebase
}

/**
 * Spotify API types
 */
export interface SpotifyArtist {
  name: string;
  // Additional properties may exist but are not used in the codebase
}

export interface SpotifyTrack {
  name: string;
  artists: SpotifyArtist[];
  // Additional properties may exist but are not used in the codebase
}

export interface SpotifyPlaylistItem {
  track: SpotifyTrack;
  // Additional properties may exist but are not used in the codebase
}

export interface SpotifyPlaylistTracksResponse {
  body: {
    items: SpotifyPlaylistItem[];
    next?: string | null;
    total?: number;
    limit?: number;
    offset?: number;
    // Additional properties may exist but are not used in the codebase
  };
}

export interface SpotifyPlaylistResponse {
  body: {
    name: string;
    // Additional properties may exist but are not used in the codebase
  };
}

export interface SpotifyClientCredentialsGrantResponse {
  body: {
    access_token: string;
    // Additional properties may exist but are not used in the codebase
  };
}

/**
 * Promise.allSettled result types
 */
export interface FulfilledResult<T> {
  status: 'fulfilled';
  value: T;
}

export interface RejectedResult {
  status: 'rejected';
  reason: unknown;
}

export type SettledResult<T> = FulfilledResult<T> | RejectedResult;

