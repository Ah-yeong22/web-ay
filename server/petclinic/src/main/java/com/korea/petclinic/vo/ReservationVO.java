package com.korea.petclinic.vo;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationVO {

	private Long id;
	private String ownerName;
	private String animalType;
	private String doctorName;
	private LocalDate reservationDate;
	private String status;
	private int price;
}
