package com.korea.movie_reservation.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationVO {
	private Integer reservationId; 

	private String customerName; 

	private Integer movieId; 

	private LocalDateTime reservationDate; 

	private String seatNumber; 

	private Integer ticketCount; 

	private String reservationStatus;

	private String movieTitle; 

	private String movieGenre; 

	private Integer ticketPrice; 

	private Integer totalPrice;
}
