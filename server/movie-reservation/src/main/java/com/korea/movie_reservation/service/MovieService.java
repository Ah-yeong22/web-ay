package com.korea.movie_reservation.service;

import org.springframework.stereotype.Service;

import com.korea.movie_reservation.mapper.MovieMapper;
import com.korea.movie_reservation.vo.MovieVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieMapper movieMapper;

    public int insertMovie(MovieVO movieVO) {
        return movieMapper.insertMovie(movieVO);
    }

    public MovieVO findMovieById(Integer movieId) {
        return movieMapper.findMovieById(movieId);
    }
}