# Custom FFmpeg  

This project contains a small custom **FFmpeg** build, with only the necessary features. It is built for `Windows 11 x86_64`.
**Feel free to change it to the version you prefer.**

## Binary info  
- **Version**: *FFmpeg 7.1*  
- **Platform**: *Windows 11 x86_64*  
- **License**: *LGPL v2.1+* (see LICENSE.md)  
- **Build environment**: *MSYS2 - MINGW64*  
- **Configuration**:  
```sh
./configure \
	--arch=x86_64 --disable-gpl \
	--enable-static --disable-shared --enable-small \
	--disable-debug --disable-autodetect \
	--disable-ffplay --disable-ffprobe --disable-doc \
	--disable-swscale --disable-swresample --disable-avdevice \
	--disable-everything \
	--enable-decoder=h264,aac \
	--enable-muxer=mp4 --enable-demuxer=mpegts,hls \
	--enable-parser=h264,aac \
	--enable-bsf=aac_adtstoasc \
	--enable-protocol=http,https,tls,tcp,file --enable-openssl \
	--pkg-config-flags="--static" \
	--extra-cflags="-I/mingw64/include" \
	--extra-ldflags="-static -static-libgcc -static-libstdc++ -L/mingw64/lib"
```  


## Source Code  
The source code is available at `ffmpeg-7.1.tar.gz`.

## Compile
To compile it by yourself, follow these general steps:
1. Install [MSYS2](https://www.msys2.org/) and set up the `MINGW64` environment.
2. Extract the **FFmpeg** source code.
3. Configure with the desired options (as shown above).
4. Build using `make -j($nproc)`.
5. Install using `make install`.

For detailed instructions, visit: https://trac.ffmpeg.org/wiki/CompilationGuide/MinGW

## Notes
- This build is optimized for minimal size and includes only essential codecs and features (H.264, AAC, MP4, MPEG-TS, HLS).
- For more information, visit FFmpeg.org.

> Compiled on 2025-05-24 for Windows 11 x86_64.  
