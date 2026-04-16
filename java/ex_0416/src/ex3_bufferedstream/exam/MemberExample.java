package ex3_bufferedstream.exam;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;

public class MemberExample {
	public static void main(String[] args) {
		BufferedWriter bw = null;
		BufferedReader br = null;
		
		try {
			br = new BufferedReader(new FileReader("members.csv"));
			bw = new BufferedWriter(new FileWriter("senior_members.txt"));

			String line;


			while((line = br.readLine()) != null) {

				String[] arr = line.split(",");

				String name = arr[0];
				int age = Integer.parseInt(arr[1]);

				if(age >= 30) {
					bw.write(name+","+age);
					bw.newLine();//개행을 해주는 메서드 

				}
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			try {
				if(bw != null) {
					bw.close();
				}
				if(br != null) {
					br.close();
				}
			} catch (Exception e2) {
				// TODO: handle exception
			}
		}
	}
}