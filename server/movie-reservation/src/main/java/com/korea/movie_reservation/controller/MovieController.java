package com.korea.movie_reservation.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.movie_reservation.service.MovieService;
import com.korea.movie_reservation.vo.MovieVO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @PostMapping
    public String insertMovie(@RequestBody MovieVO movieVO) {

        int result = movieService.insertMovie(movieVO);

        if (result == 1) {
            return "영화 등록 성공";
        }

        return "영화 등록 실패";
    }

    @GetMapping("/{movieId}")
    public MovieVO findMovieById(
            @PathVariable Integer movieId) {

        return movieService.findMovieById(movieId);
    }
}
