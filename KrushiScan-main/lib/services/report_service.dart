import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';
import '../models/report_model.dart';

class ReportService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  Future<String?> uploadImage(File imageFile, String userId) async {
    try {
      final ref = _storage.ref().child(
        'reports/$userId/${DateTime.now().millisecondsSinceEpoch}.jpg',
      );
      await ref.putFile(imageFile);
      return await ref.getDownloadURL();
    } catch (e) {
      return null;
    }
  }

  Future<void> submitReport(ReportModel report) async {
    await _firestore.collection('reports').add(report.toMap());
  }

  Future<List<ReportModel>> getUserReports(String userId) async {
    try {
      final snapshot = await _firestore
          .collection('reports')
          .where('userId', isEqualTo: userId)
          .get(); // removed orderBy

      final list = snapshot.docs
          .map((doc) => ReportModel.fromMap(doc.data(), doc.id))
          .toList();

      // Sort locally instead
      list.sort((a, b) => b.submittedAt.compareTo(a.submittedAt));
      return list;
    } catch (e) {
      return []; // return empty list on error
    }
  }
}
