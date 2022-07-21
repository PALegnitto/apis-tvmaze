"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios.get('http://api.tvmaze.com/search/shows',
  {params: {q: term}})
  console.debug('GET',response );

  const showList = response.data.map( function (x) {
    let fallBackImage = "";
    if (x.show.image === null) {
      fallBackImage = "https://tinyurl.com/tv-missing"

    }
    else {
      fallBackImage = x.show.image.original;
    }

    const result = {
      id: x.show.id,
      name: x.show.name,
      summary: x.show.summary,
      image: fallBackImage
      // x.show.image.original ? x.show.image.original : "https://tinyurl.com/tv-missing"
    }
   return result;

  })

return showList;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src= ${show.image}
              alt= ${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
    const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
    const episodeList = response.data.map(function(x) {
      const result = {
        id: x.id,
        name: x.name,
        season: x.season,
        number: x.number
      }
      return result;
    }
    )
    return episodeList;
}

/** Formatting each episode and adding them to the episodes area in DOM*/

function populateEpisodes(episodes) {
  $("#episodesList").empty();

  for (let episode of episodes) {
    const uniqueEpisode =
      $(`<li>${episode.name}
      (season ${episode.season}, number ${episode.number})</li>`);

  $("#episodesList").append(uniqueEpisode);
 };
 $episodesArea.show();
}
//put event listener on showsList area so when we click on button execute function

async function searchForEpisodesAndDisplay(evt) {
  //search "closest" ancestor with the class of
  //.Show (which is put onto the enclosing div, which
  // has the .data-show-id attribute).
  const id = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", searchForEpisodesAndDisplay);