jQuery( document ).ready( function ( $ ) {
	'use strict';
	var recurrenceType = $( 'select#hmbkp_schedule_recurrence_type' );
	// Don't ever cache ajax requests
	$.ajaxSetup( {'cache': false} );

	if ( recurrenceType.length ) {

		hmbkpToggleScheduleFields( recurrenceType.val() );

		$( document ).on( 'change', 'select#hmbkp_schedule_recurrence_type', function () {
			hmbkpToggleScheduleFields( $( this ).val() );
		} );

	}

	// Show delete confirm message for delete schedule
	$( document ).on( 'click', '.hmbkp-schedule-actions .delete-action', function ( e ) {

		if ( ! confirm( hmbkp.delete_schedule ) ) {
			e.preventDefault();
		}

	} );

	// Show delete confirm message for delete backup
	$( document ).on( 'click', '.hmbkp_manage_backups_row .delete-action', function ( e ) {

		if ( ! confirm( hmbkp.delete_backup ) ) {
			e.preventDefault();
		}

	} );

	// Show delete confirm message for remove exclude rule
	$( document ).on( 'click', '.hmbkp-edit-schedule-excludes-form .delete-action', function ( e ) {

		if ( ! confirm( hmbkp.remove_exclude_rule ) ) {
			e.preventDefault();
		}

	} );

	// Test the cron response using ajax
	//$.post( ajaxurl, {'nonce': hmbkp.nonce, 'action': 'hmbkp_cron_test'},
	//	function ( data ) {
	//		if ( data !== '1' ) {
	//			$( '.wrap > h2' ).after( data );
	//		}
	//	}
	//);

	// Run a backup
	$( document ).on( 'click', '.hmbkp-run', function ( e ) {

		$( this ).closest( '.hmbkp-schedule-sentence' ).addClass( 'hmbkp-running' );

		$( '.hmbkp-error' ).removeClass( 'hmbkp-error' );

		var scheduleId = $( '[data-hmbkp-schedule-id]' ).attr( 'data-hmbkp-schedule-id' );

		var ajaxRequest = $.post(
			ajaxurl,
			{
				hmbkp_run_schedule_nonce : hmbkp.hmbkp_run_schedule_nonce,
				action : 'hmbkp_run_schedule',
				hmbkp_schedule_id : scheduleId
			}
		);
		hmbkpRedirectOnBackupComplete();
		e.preventDefault();

	} );

	// Closing ThickBox Modal Window
	$( document ).on( 'click', '.hmbkp-thickbox-close', function ( e ) {

		e.preventDefault();
		window.parent.tb_remove();

	} );

} );

function hmbkpRedirectOnBackupComplete( status ) {

	jQuery.post(
		ajaxurl,
		{
			nonce: hmbkp.nonce,
			action : 'hmbkp_is_in_progress',
			hmbkp_schedule_id : jQuery( '[data-hmbkp-schedule-id]' ).attr( 'data-hmbkp-schedule-id' )
		},

		function( data ) {

			if ( data == 0 && jQuery( '.hmbkp-error' ).length === 0 ) {

				location.reload( true );

			} else {
				jQuery( '.hmbkp-status' ).remove();
				if ( data == 99 ) {
					jQuery( '.hmbkp-schedule-actions' ).replaceWith( 'Starting' );
				} else {
					jQuery( '.hmbkp-schedule-actions' ).replaceWith( data );
				}

				setTimeout( hmbkpRedirectOnBackupComplete, 2000 );

			}
		}
	);

}

function hmbkpToggleScheduleFields( recurrence ) {

	recurrence = (
	typeof recurrence !== 'undefined'
	) ? recurrence : 'manually';

	var settingFields = jQuery( '.recurring-setting' );
	var scheduleSettingFields = jQuery( '#schedule-start' );
	var twiceDailyNote = jQuery( '.twice-js' );

	switch ( recurrence ) {

		case 'manually':
			settingFields.hide();
			break;

		case 'hourly' :
			settingFields.hide();
			break;

		case 'daily' :
			settingFields.hide();
			scheduleSettingFields.show();
			twiceDailyNote.hide();
			break;

		case 'twicedaily' :
			settingFields.hide();
			scheduleSettingFields.show();
			twiceDailyNote.show();
			break;

		case 'weekly' : // fall through
		case 'fortnightly' :
			settingFields.hide();
			jQuery( '#start-day' ).show();
			scheduleSettingFields.show();
			twiceDailyNote.hide();
			break;

		case 'monthly' :
			settingFields.hide();
			scheduleSettingFields.show();
			jQuery( '#start-date' ).show();
			twiceDailyNote.hide();
			break;

	}

}

function hmbkpCatchResponseAndOfferToEmail( data ) {

	// Backup Succeeded
	if ( ! data || data === 0 ) {
		location.reload( true );
	}

	// The backup failed, show the error and offer to have it emailed back
	else {

		jQuery( '.hmbkp-schedule-sentence.hmbkp-running' ).removeClass( 'hmbkp-running' ).addClass( 'hmbkp-error' );

		jQuery.post(
			ajaxurl,
			{'nonce': hmbkp.nonce, 'action': 'hmbkp_backup_error', 'hmbkp_error': data},
			function ( data ) {

				if ( ! data || data === 0 ) {
					return;
				} else {
					location.reload( true );
				}
			}
		);

	}

	jQuery( document ).one( 'click', '.hmbkp_send_error_via_email', function ( e ) {

		e.preventDefault();

		jQuery( this ).addClass( 'hmbkp-ajax-loading' ).attr( 'disabled', 'disabled' );

		jQuery.post(
			ajaxurl,
			{'nonce': hmbkp.nonce, 'action': 'hmbkp_email_error', 'hmbkp_error': data},
			function () {
				//jQuery.colorbox.close();
			}
		);

	} );

}
