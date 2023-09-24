use core::panic;
use std::cmp::max;

use wasm_bindgen::prelude::wasm_bindgen;

use crate::{camera::{Camera, Projector}, chunkstore::ChunkStore, viewport::Viewport};

// const RENDER_DISTANCE:f32 = 1536.0;
const FOV: f32 = 75.0f32;
#[wasm_bindgen]
pub struct Universe {
    camera: Camera,
    chunk_store: ChunkStore,
    width: u32,
    height: u32
}

#[wasm_bindgen]
impl Universe {
    //The default render distance is 1536.
    pub fn new(width: u32, height: u32, render_distance: f32) -> Self{
        let camera = Camera::new(max(width, height) as f32, FOV.to_radians(), render_distance);
        let chunk_store = ChunkStore::start(&camera);
        Universe{
            camera,
            chunk_store,
            width,
            height
        }
    }
    
    pub fn count_stars(&self) -> usize {
        self.chunk_store.count_stars()
    }

    pub fn project_stars(&self, arr: &mut [f32]) -> u32{ //Returns the number of stars that are in front of the camera.
        let mut index = 0usize;
        let star_iter = self.chunk_store.iter();
        let projector = Projector::new(&self.camera, &self.camera.rvp);
        let point_iterator = star_iter.map(|star| {
            projector.project_point(star)
        });

        let mut render_star_count = 0;
        let max_dist = self.camera.cvp.get_alpha() / self.camera.rvp.get_alpha();
        for point in point_iterator { //crash here caused by out of bounds
            if let Some(p) = point {
                
                let ax = p.y + (self.width/2) as f32;
                let ay = p.z + (self.height/2) as f32;
                if
                    p.x > 0.0 &&
                    (1.0/p.x) < max_dist &&
                    ax >= 0.0 && ax < self.width as f32 &&
                    ay >= 0.0 && ay < self.height as f32
                {
                    let scale = p.x/50.0; //Moved scale here to prevent a /0 crash.
                    let offset = scale/2.0;
                    arr[index] = scale;
                    arr[index+1] = ax-offset;
                    arr[index+2] = ay-offset;
                    render_star_count += 1;
                    index+=3;
                }
            }
        }

        render_star_count
    }

    pub fn set_size(&mut self, width: u32, height: u32) {
        self.camera.rvp = Viewport::fov_maxbound(FOV.to_radians(), max(width, height) as f32);
        self.width = width;
        self.height = height;
    }

    pub fn tick(&mut self, delta: f32) {
        self.camera.tick(delta);
        // let now_a = Date::now();
        self.chunk_store.update(&self.camera);
        // let time = Date::now() - now_a;
        // if time > 16.0 {
        //     log(&format!("WARNING. Slow chunkgen time: {}", time));
        // }
    }

    pub fn set_camera_roll_vel(&mut self, roll: f32){
        self.camera.target_rpy_vel.x = roll;
    }

    pub fn set_camera_pitch_vel(&mut self, pitch: f32){
        self.camera.target_rpy_vel.y = pitch;
    }
    
    pub fn set_camera_yaw_vel(&mut self, yaw: f32){
        self.camera.target_rpy_vel.z = yaw;
    }

    pub fn set_thrust(&mut self, speed: f32) {
        self.camera.thrust = speed;
    }

    pub fn get_camera_vecs(&self, vecs: &mut [f32]) {
        if vecs.len() == 9 {
            let inverted = self.camera.ori.get_mat().invert();
            if let Some(rots) = inverted {
                vecs.copy_from_slice(&rots.values);
            }
        } else {
            panic!("Bad array length");
        }
    }

    pub fn get_render_dist_ratio(&self) -> f32{
        self.camera.rvp.get_maxbound()/self.camera.cvp.get_maxbound()
    }
}