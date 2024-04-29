<?php

/**
 * Plugin Name: Restful API Custom Header
 * Description: Custom authorization header for the restful api.
 * Version: 0.1
 * Author: Visor
 **/

require_once(dirname(__FILE__) . '/custom-filter-acf.php');

function check_auth($result, $server, $request)
{
	$requested_route = $request->get_route();
	$referer = $request->get_header('X-Custom-Api-Key');

	if ('/wp/v2/api-key' === $requested_route || '/wp/v2/nft' === $requested_route) {
		if (!$referer) {
			return wp_send_json_error(new WP_Error('Unauthorized', 'Unauthorized access'), 401);
		}

		if ($referer != CUSTOM_API_KEY) {
			return wp_send_json_error(new WP_Error('Unauthorized', 'Unauthorized access'), 401);
		}
	}
}

add_filter('rest_pre_dispatch', 'check_auth', 10, 3);

function json_basic_auth_error($error)
{
	// Passthrough other errors
	if (!empty($error)) {
		return $error;
	}

	global $wp_json_basic_auth_error;

	return $wp_json_basic_auth_error;
}

add_filter('rest_authentication_errors', 'json_basic_auth_error');
