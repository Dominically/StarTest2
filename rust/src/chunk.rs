use std::iter::Iterator;


use rand::{SeedableRng, prelude::StdRng, Rng};
use crate::{vector3::{PointVector, ChunkVector, CHUNK_SIZE}};


pub struct Chunk {
    pub stars: Vec<PointVector>,
    pub pos: ChunkVector
}

impl Chunk {
    pub fn populate(chunk: ChunkVector) -> Self {
        let seed = Self::gen_seed(chunk);
        let mut rng = StdRng::seed_from_u64(seed);
        let num_stars:u32 = rng.gen_range(0..5);
        let mut stars = vec!();
        (0..num_stars).for_each(|_| {
            let offsets = PointVector::new(
                rng.gen(),
                rng.gen(),
                rng.gen()
            );

            let absolute_pos = PointVector::new(
                (offsets.x + chunk.x as f32)*(CHUNK_SIZE as f32),
                (offsets.y + chunk.y as f32)*(CHUNK_SIZE as f32),
                (offsets.z + chunk.z as f32)*(CHUNK_SIZE as f32),
            );

            stars.push(absolute_pos);
        
        });

        return Self {
            stars,
            pos: chunk,
        }

    }

    fn gen_seed(coords: ChunkVector) -> u64 {
        let p = coords.x;
        let q = coords.y * 889438532;
        let r = coords.z * 374324760;
        let total:i64 = (p+q+r) as i64;
        unsafe {
            std::mem::transmute::<i64, u64>(total)
        }
    }
}
