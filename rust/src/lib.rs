use universe::Universe;
use wasm_bindgen::prelude::wasm_bindgen;

mod vector3;
mod universe;
mod chunk;
mod matrix;
mod orientation;
mod camera;
mod viewport;
mod chunkstore;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32{
    a+b
}

#[wasm_bindgen]
pub fn new_universe(width: u32, height: u32) -> Universe{
    Universe::new(width, height)
}