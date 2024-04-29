<?php

/**
 * Plugin Name: WP REST Nft & Art
 * Description: Filtros customizados para NFTs e Arts
 * Author: Visor
 * Version: 0.1
 **/


function query_by_year($args, $request)
{

	// Bail out if no filter parameter is set.
	if (empty($request['filter']) || !is_array($request['filter'])) {
		return $args;
	}


	$filter = $request['filter'];


	if (isset($filter['posts_per_page']) && ((int) $filter['posts_per_page'] >= 1 && (int) $filter['posts_per_page'] <= 100)) {
		$args['posts_per_page'] = $filter['posts_per_page'];
	}


	global $wp;
	$vars = apply_filters('rest_query_vars', $wp->public_query_vars);

	// Allow valid meta query vars.
	$vars = array_unique(array_merge($vars, array('meta_query', 'meta_key', 'meta_value', 'meta_compare')));

	foreach ($vars as $var) {
		if (isset($filter[$var])) {
			$args[$var] = $filter[$var];
		}
	}
	return $args;
}

add_filter("rest_nft_query", "query_by_year", 10, 2);
add_filter("rest_art_query", "query_by_year", 10, 2);
