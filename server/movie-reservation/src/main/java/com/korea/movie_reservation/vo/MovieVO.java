package com.korea.movie_reservation.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieVO {
	private Integer movieId; 

	private String movieTitle; 

	private String movieGenre; 

	private Integer runningTime; 

	private Integer ticketPrice; 

	private LocalDateTime releaseDate;
}
