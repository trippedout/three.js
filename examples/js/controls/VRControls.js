/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */

import {Matrix4} from 'three'

export default class VRControls {

	constructor( camera, onError ) {
		this.camera = camera;
		this.onError = onError;

		this.vrDisplay = null;
		this.vrDisplays = null;

		this.standingMatrix = new Matrix4();

		this.frameData = null;
		if ( 'VRFrameData' in window ) {
			this.frameData = new VRFrameData();
		}

		if ( navigator.getVRDisplays ) {
			navigator.getVRDisplays().then( this.gotVRDisplays.bind(this) );
		}

		// the Rift SDK returns the position in meters
		// this scale factor allows the user to define how meters
		// are converted to scene units.
		this.scale = 1;

		// If true will use "standing space" coordinate system where y=0 is the
		// floor and x=0, z=0 is the center of the room.
		this.standing = false;

		// Distance from the users eyes to the floor in meters. Used when
		// standing=true but the VRDisplay doesn't provide stageParameters.
		this.userHeight = 1.6;
	}

	gotVRDisplays( displays ) {
		this.vrDisplays = displays;

		if ( displays.length > 0 ) {
			this.vrDisplay = displays[ 0 ];
		} else {
			if ( this.onError ) this.onError( 'VR input not available.' );
		}
	}

	getVRDisplay() {
		return this.vrDisplay;
	}

	getVRDisplays() {
		return this.vrDisplays;
	}

	getStandingMatrix() {
		return this.standingMatrix;
	}

	update() {
		if ( this.vrDisplay ) {
			var pose;

			if ( this.vrDisplay.getFrameData ) {
				this.vrDisplay.getFrameData( this.frameData );
				pose = this.frameData.pose;
				
			} else if ( this.vrDisplay.getPose ) {
				pose = this.vrDisplay.getPose();
			}

			if ( pose.orientation !== null ) {
				this.camera.quaternion.fromArray( pose.orientation );
			}

			if ( pose.position !== null ) {
				this.camera.position.fromArray( pose.position );
			} else {
				this.camera.position.set( 0, 0, 0 );
			}

			if ( this.standing ) {
				if ( this.vrDisplay.stageParameters ) {
					this.camera.updateMatrix();

					this.standingMatrix.fromArray( this.vrDisplay.stageParameters.sittingToStandingTransform );
					this.camera.applyMatrix( this.standingMatrix );

				} else {
					this.camera.position.setY( this.camera.position.y + this.userHeight );
				}
			}

			this.camera.position.multiplyScalar( this.camera.scale );
		}
	}

	resetPose() {
		if ( this.vrDisplay ) {
			this.vrDisplay.resetPose();
		}
	}

	resetSensor() {
		console.warn( 'THREE.VRControls: .resetSensor() is now .resetPose().' );
		this.resetPose();
	}

	zeroSensor() {
		console.warn( 'THREE.VRControls: .zeroSensor() is now .resetPose().' );
		this.resetPose();
	}

	dispose() {
		this.vrDisplay = null;
	}
};
