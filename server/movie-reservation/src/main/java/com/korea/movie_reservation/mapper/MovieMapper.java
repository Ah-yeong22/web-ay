package com.korea.movie_reservation.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.korea.movie_reservation.vo.MovieVO;

@Mapper
public interface MovieMapper {

	int insertMovie(MovieVO movieVO);
	
	MovieVO findMovieById(Integer movieId);
}
