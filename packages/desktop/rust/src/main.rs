use std::str;
use std::net::SocketAddr;
use socket2::{Socket, Domain, Type, Protocol};
use serde_json::{Value};

fn main() {
    let socket = Socket::new(
        Domain::ipv4(),
        Type::dgram(),
        Some(Protocol::udp())
    ).unwrap();

    let addr = &"0.0.0.0:12345".parse::<SocketAddr>().unwrap().into();

    socket.set_reuse_address(true).unwrap();
    socket.set_reuse_port(true).unwrap();
    socket.bind(addr).unwrap();

    loop {
        let mut buf = [0; 65507];
        let (size, address) = socket.recv_from(&mut buf).unwrap();

        let data = match str::from_utf8(&buf[..size]) {
            Ok(v) => v,
            Err(e) => panic!("Invalid UTF-8 sequence: {}", e),
        };

        let json: Value = serde_json::from_str(data)
            .expect("Could not parse JSON");

        println!("-> from {:?}: {}", address.as_inet(), json["data"]["advertisement"]["name"]);
    }
}