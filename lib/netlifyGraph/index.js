// GENERATED VIA NETLIFY AUTOMATED DEV TOOLS, EDIT WITH CAUTION!
import buffer from "buffer";
import crypto from "crypto";
import https from "https";
import process from "process";

export const verifySignature = (input) => {
  const secret = input.secret;
  const body = input.body;
  const signature = input.signature;

  if (!signature) {
    console.error("Missing signature");
    return false;
  }

  const sig = {};
  for (const pair of signature.split(",")) {
    const [key, value] = pair.split("=");
    sig[key] = value;
  }

  if (!sig.t || !sig.hmac_sha256) {
    console.error("Invalid signature header");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(sig.t)
    .update(".")
    .update(body)
    .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(sig.hmac_sha256, "hex")
    )
  ) {
    console.error("Invalid signature");
    return false;
  }

  if (parseInt(sig.t, 10) < Date.now() / 1000 - 300 /* 5 minutes */) {
    console.error("Request is too old");
    return false;
  }

  return true;
};

const operationsDoc = `mutation LetsPlay($trackIds: [String!] = "") @netlify(id: """2f7792ae-0d2d-4341-bd28-8e704f9909c7""", doc: """An empty mutation to start from""") {
  spotify {
    playTrack(input: {trackIds: $trackIds}) {
      player {
        isPlaying
      }
    }
  }
}

mutation PlaySong($trackIds: [String!] = "") @netlify(id: """2fd6e27f-0d9f-4c8e-bd76-41597fed83e6""", doc: """Play a song in Spotify!""") {
  spotify {
    playTrack(input: {trackIds: $trackIds}) {
      player {
        isPlaying
      }
    }
  }
}

query SpotifySearch($query: String = "Almost Famous") @netlify(id: """70651d20-ca01-4bd2-8e9a-1652ad224fbf""", doc: """Search for a song on Spotify using Netlify Graph""") {
  spotify {
    search(data: {query: $query}) {
      tracks {
        id
        name
        artists {
          name
        }
      }
    }
  }
}
`;

const httpFetch = (siteId, options) => {
  const reqBody = options.body || null;
  const userHeaders = options.headers || {};
  const headers = {
    ...userHeaders,
    "Content-Type": "application/json",
    "Content-Length": reqBody.length,
  };

  const timeoutMs = 30_000;

  const reqOptions = {
    method: "POST",
    headers: headers,
    timeout: timeoutMs,
  };

  const url = "https://serve.onegraph.com/graphql?app_id=" + siteId;

  const respBody = [];

  return new Promise((resolve, reject) => {
    const req = https.request(url, reqOptions, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode > 299)) {
        return reject(
          new Error(
            "Netlify Graph return non-OK HTTP status code" + res.statusCode
          )
        );
      }

      res.on("data", (chunk) => respBody.push(chunk));

      res.on("end", () => {
        const resString = buffer.Buffer.concat(respBody).toString();
        resolve(resString);
      });
    });

    req.on("error", (error) => {
      console.error("Error making request to Netlify Graph:", error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request to Netlify Graph timed out"));
    });

    req.write(reqBody);
    req.end();
  });
};

const fetchNetlifyGraph = async function fetchNetlifyGraph(input) {
  const query = input.query;
  const operationName = input.operationName;
  const variables = input.variables;

  const options = input.options || {};
  const accessToken = options.accessToken;
  const siteId = options.siteId || process.env.SITE_ID;

  const payload = {
    query: query,
    variables: variables,
    operationName: operationName,
  };

  const result = await httpFetch(siteId, {
    method: "POST",
    headers: {
      Authorization: accessToken ? "Bearer " + accessToken : "",
    },
    body: JSON.stringify(payload),
  });

  return JSON.parse(result);
};

export const verifyRequestSignature = (request, options) => {
  const event = request.event;
  const secret =
    options.webhookSecret || process.env.NETLIFY_GRAPH_WEBHOOK_SECRET;
  const signature = event.headers["x-netlify-graph-signature"];
  const body = event.body;

  if (!secret) {
    console.error(
      "NETLIFY_GRAPH_WEBHOOK_SECRET is not set, cannot verify incoming webhook request"
    );
    return false;
  }

  return verifySignature({ secret, signature, body: body || "" });
};

export const executeLetsPlay = (variables, options) => {
  return fetchNetlifyGraph({
    query: operationsDoc,
    operationName: "LetsPlay",
    variables: variables,
    options: options || {},
  });
};

export const executePlaySong = (variables, options) => {
  return fetchNetlifyGraph({
    query: operationsDoc,
    operationName: "PlaySong",
    variables: variables,
    options: options || {},
  });
};

export const fetchSpotifySearch = (variables, options) => {
  return fetchNetlifyGraph({
    query: operationsDoc,
    operationName: "SpotifySearch",
    variables: variables,
    options: options || {},
  });
};

/**
 * The generated NetlifyGraph library with your operations
 */
const functions = {
  /**
   * An empty mutation to start from
   */
  executeLetsPlay: executeLetsPlay,
  /**
   * Play a song in Spotify!
   */
  executePlaySong: executePlaySong,
  /**
   * Search for a song on Spotify using Netlify Graph
   */
  fetchSpotifySearch: fetchSpotifySearch,
};

export default functions;

export const handler = () => {
  // return a 401 json response
  return {
    statusCode: 401,
    body: JSON.stringify({
      message: "Unauthorized",
    }),
  };
};
