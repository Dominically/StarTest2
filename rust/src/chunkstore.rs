use std::{slice::Iter, mem::replace};
use itertools::iproduct;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::{vector3::{ChunkVector, PointVector, Vector3}, camera::{Camera}, chunk::Chunk};

pub struct ChunkStore {
    lo: ChunkVector,
    hi: ChunkVector,
    delta: ChunkVector, // = hi-lo
    num_stars: usize,
    chunks: Vec<Box<Chunk>>
}
pub struct ChunkStoreIter<'a>{
    chunks_iter: Iter<'a, Box<Chunk>>,
    points_iter: Iter<'a, PointVector>,
    i: usize
}

impl ChunkStore {
    pub fn start(cam: &Camera) -> Self {
        let (lo, hi, delta) = Self::get_gen_bounds(cam);

        let mut chunks = Vec::with_capacity((delta.x * delta.y * delta.z) as usize);
        let mut num_stars = 0;

        for (x, y, z) in iproduct!(lo.x..hi.x, lo.y..hi.y, lo.z..hi.z) {
            let chunk = Self::make_chunk(x, y, z);
            num_stars += chunk.stars.len();
            chunks.push(chunk);
        }

        Self {
            lo,
            hi,
            delta,
            chunks,
            num_stars
        }
    }

    pub fn update(&mut self, cam: &Camera) { //Consumes the ChunkStore.
        let (new_lo, new_hi, new_delta) = Self::get_gen_bounds(&cam);


        let new_chunk_arr = Vec::with_capacity((new_delta.x * new_delta.y * new_delta.z) as usize);
        let mut num_stars = 0;

        let old_stars = replace(&mut self.chunks, new_chunk_arr);
        
        let mut chunk_iter = old_stars.into_iter();
        let mut current_chunk = chunk_iter.next();


        for (x, y, z) in iproduct!(new_lo.x..new_hi.x, new_lo.y..new_hi.y, new_lo.z..new_hi.z) {
            let mut this_chunk = None;
            while let Some(chunk) = current_chunk { //Skip the chunks in the chunk buffer until the one equal or greater than the current one has been reached.
                if
                    chunk.pos.x < x ||
                    chunk.pos.x == x && chunk.pos.y < y ||
                    chunk.pos.x == x && chunk.pos.y == y && chunk.pos.z < z
                {
                    current_chunk = chunk_iter.next();
                    continue;
                } else if chunk.pos.x == x && chunk.pos.y == y && chunk.pos.z == z { //Chunk found
                    this_chunk = Some(chunk);
                    current_chunk = chunk_iter.next();
                    break;
                } else { //No chunk found, make a new one.
                    current_chunk = chunk_iter.next();
                    break; //Important do not remove.
                }
            }

            match this_chunk {
                Some(chunk) => {
                    num_stars += chunk.stars.len();
                    self.chunks.push(chunk);
                },
                None => {
                    let chunk = Self::make_chunk(x, y, z);
                    num_stars += chunk.stars.len();
                    self.chunks.push(chunk);
                },
            }
        }

        self.lo = new_lo;
        self.hi = new_hi;
        self.delta = new_delta;
        self.num_stars = num_stars;
    }

    fn make_chunk(x:i32, y:i32, z:i32) -> Box<Chunk>{
        Box::new(Chunk::populate(ChunkVector::new(x, y, z)))
    }

    pub fn count_stars(&self) -> usize{
        self.num_stars
    } 

    fn get_gen_bounds(cam: &Camera) -> (ChunkVector, ChunkVector, ChunkVector) { //Returns the low bounds, high bounds and delta.
        let cam_dirs = cam.ori.get_mat().to_vectors_vert();
        let max_point = cam.pos + cam_dirs[2] * cam.cvp.get_alpha(); //Find the endpoint.
        let maxbound_half = cam.cvp.get_maxbound() / 2.0;


        let cam_point = ChunkVector::from_point(cam.pos);
        //its only 4 lines.
        let point_a  = ChunkVector::from_point(max_point - cam_dirs[0]*maxbound_half + cam_dirs[1]*maxbound_half);
        let point_b  = ChunkVector::from_point(max_point + cam_dirs[0]*maxbound_half + cam_dirs[1]*maxbound_half);
        let point_c  = ChunkVector::from_point(max_point + cam_dirs[0]*maxbound_half - cam_dirs[1]*maxbound_half);
        let point_d  = ChunkVector::from_point(max_point - cam_dirs[0]*maxbound_half - cam_dirs[1]*maxbound_half);

        let (lo, hi) = Vector3::bounds(&[&cam_point, &point_a, &point_b, &point_c, &point_d]).unwrap(); //impossible for this to crash...
        //Add padding
        let hi = hi + ChunkVector::new(1, 1, 1); //To make high bounds exclusive.
        let delta = hi - lo;
        return (lo, hi, delta);
    }

    pub fn iter(&self) -> ChunkStoreIter {
        let chunks_iter = self.chunks.iter();
        let points_iter = [].iter(); //Empty iterator for now.

        ChunkStoreIter { chunks_iter, points_iter, i: 0 }
    }
}

impl<'a> Iterator for ChunkStoreIter<'a> {
    type Item = &'a PointVector;

    fn next(&mut self) -> Option<Self::Item> {
        let mut next_star = self.points_iter.next();
        while let None = next_star {
            let next_chunk = self.chunks_iter.next();
            match next_chunk {
                Some(chunk) => {
                    let mut new_iter = chunk.stars.iter();
                    next_star = new_iter.next();
                    self.points_iter = new_iter;
                },
                None => {
                    return None;
                },
            }
        }
        self.i += 1;
        let star = next_star.unwrap();
        return Some(star);
    }
}